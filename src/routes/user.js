import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Pokemon from '../models/Pokemon.js';
const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password').populate('pokemons');
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/me/buy/:pokemonId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const pokemonId = parseInt(req.params.pokemonId, 10);
    if (isNaN(pokemonId)) {
      return res.status(400).json({ success: false, message: "ID de Pokémon invalide" });
    }

    const pokemon = await Pokemon.findOne({ id: pokemonId });
    if (!pokemon) {
      return res.status(404).json({ success: false, message: "Pokémon non trouvé" });
    }

    if (user.orbes < pokemon.price) {
      return res.status(400).json({ success: false, message: "Orbes insuffisants" });
    }

    user.orbes -= pokemon.price;
    user.pokemons.push(pokemon._id);
    await user.save();

    await user.populate('pokemons');

    return res.status(200).json({
      success: true,
      message: "Pokémon acheté avec succès ! Dirigez-vous dans votre arsenal pour l'améliorer ou le vendre",
      orbes: user.orbes,
      pokemons: user.pokemons
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur lors de l'achat", error: err.message });
  }
});

router.post('/me/sell/:pokemonId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const pokemonId = parseInt(req.params.pokemonId, 10);
    if (isNaN(pokemonId)) {
      return res.status(400).json({ success: false, message: "ID de Pokémon invalide" });
    }

    const pokemon = await Pokemon.findOne({ id: pokemonId });
    if (!pokemon) {
      return res.status(404).json({ success: false, message: "Pokémon non trouvé" });
    }

    const idx = user.pokemons.findIndex(p => p.equals(pokemon._id));
    if (idx === -1) {
      return res.status(400).json({ success: false, message: "Vous ne possédez pas ce Pokémon" });
    }

    user.pokemons.splice(idx, 1);
    const salePrice = Math.floor(pokemon.price * 0.8); // 20% de moins que le prix d'achat
    user.orbes += salePrice;
    await user.save();

    await user.populate('pokemons');

    return res.status(200).json({
      success: true,
      message: `Pokémon vendu avec succès ! Vous récupérez ${salePrice} orbes.`,
      orbes: user.orbes,
      salePrice,
      pokemons: user.pokemons
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur lors de la vente", error: err.message });
  }
});

export default router;