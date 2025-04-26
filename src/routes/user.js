// Fichier des routes liées à l'utilisateur (profil, achat, vente, quêtes, etc.)
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'; // Vérifie le token JWT
import User from '../models/User.js'; // Modèle utilisateur
import Pokemon from '../models/Pokemon.js'; // Modèle Pokémon
import Quest from '../models/Quest.js'; // Modèle de quête
import UserQuest from '../models/UserQuest.js'; // Modèle de progression de quête
import checkRole from '../middleware/roleMiddleware.js'; // Vérifie le rôle
const router = express.Router(); // Création du routeur

// Récupérer les infos de l'utilisateur connecté (nécessite d'être connecté)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.userId)
      .select('username email role orbes pokemons dateDerRecomp derConnect nbachats nbventes nbConnexions createdAt')
      .populate('pokemons');
    // Si nouvelle connexion du jour, on met à jour derConnect et nbConnexions
    const today = new Date().toDateString();
    if (!user.derConnect || new Date(user.derConnect).toDateString() !== today) {
      user.derConnect = new Date();
      user.nbConnexions = (user.nbConnexions || 0) + 1;
      await user.save();
      user = await User.findById(req.userId)
        .select('username email role orbes pokemons dateDerRecomp derConnect nbachats nbventes nbConnexions createdAt')
        .populate('pokemons');
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Acheter un Pokémon (seulement pour les utilisateurs connectés et rôle 'user')
router.post('/me/buy/:pokemonId', authMiddleware, checkRole(['user']), async (req, res) => {
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

    // Clamp progression de la quête 'achat'
    const achatQuest = await Quest.findOne({ key: 'achat', active: true });
    if (achatQuest) {
      let uq = await UserQuest.findOne({ user: user._id, quest: achatQuest._id });
      if (!uq) {
        uq = new UserQuest({ user: user._id, quest: achatQuest._id, progress: 1, completed: 1 >= achatQuest.target });
      } else if (!uq.completed) {
        uq.progress = Math.min(uq.progress + 1, achatQuest.target);
        if (uq.progress >= achatQuest.target) uq.completed = true;
      }
      await uq.save();
    }

    return res.status(200).json({
      success: true,
      message: "Pokémon acheté avec succès !",
      orbes: user.orbes,
      pokemons: user.pokemons
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur lors de l'achat", error: err.message });
  }
});

// Vendre un Pokémon (seulement pour les utilisateurs connectés et rôle 'user')
router.post('/me/sell/:pokemonId', authMiddleware, checkRole(['user']), async (req, res) => {
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

    // Clamp progression de la quête 'vente'
    const venteQuest = await Quest.findOne({ key: 'vente', active: true });
    if (venteQuest) {
      let uq = await UserQuest.findOne({ user: user._id, quest: venteQuest._id });
      if (!uq) {
        uq = new UserQuest({ user: user._id, quest: venteQuest._id, progress: 1, completed: 1 >= venteQuest.target });
      } else if (!uq.completed) {
        uq.progress = Math.min(uq.progress + 1, venteQuest.target);
        if (uq.progress >= venteQuest.target) uq.completed = true;
      }
      await uq.save();
    }

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

// Récupérer la récompense journalière (10 orbes par jour)
router.post('/me/daily-reward', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    const today = new Date().toDateString();
    const alreadyClaimed = user.dateDerRecomp && new Date(user.dateDerRecomp).toDateString() === today;
    if (!alreadyClaimed) {
      user.orbes += 10;
      user.dateDerRecomp = new Date();
      await user.save();
    }
    return res.status(200).json({
      success: true,
      orbes: user.orbes,
      dateDerRecomp: user.dateDerRecomp,
      dailyRewardClaimed: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération de la récompense journalière", error: err.message });
  }
});

// Voir la progression des quêtes de l'utilisateur
router.get('/me/quests', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toDateString();
    const dailyRewardClaimed = user.dateDerRecomp && new Date(user.dateDerRecomp).toDateString() === today;
    // Charger définitions de quêtes actives
    const defs = await Quest.find({ active: true });
    // Charger ou initialiser la progression
    const quests = await Promise.all(defs.map(async def => {
      let uq = await UserQuest.findOne({ user: user._id, quest: def._id });
      if (!uq) {
        uq = await UserQuest.create({ user: user._id, quest: def._id });
      }
      return {
        _id: def._id,
        key: def.key,
        name: def.name,
        target: def.target,
        reward: def.reward,
        resetFrequency: def.resetFrequency,
        current: uq.progress,
        completed: uq.completed,
        claimed: uq.claimed
      };
    }));
    return res.json({ dailyRewardClaimed, orbesReward: 10, quests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Récupérer la récompense d'une quête terminée
router.post('/me/quests/:id/claim', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const questId = req.params.id;
    // Charger la progression
    const uq = await UserQuest.findOne({ user: userId, quest: questId }).populate('quest');
    if (!uq) {
      return res.status(404).json({ success: false, message: 'Progression introuvable' });
    }
    if (!uq.completed) {
      return res.status(400).json({ success: false, message: 'Quête non terminée' });
    }
    if (uq.claimed) {
      // Déjà réclamée : on renvoie OK sans erreur
      const user = await User.findById(userId);
      return res.json({ success: true, message: 'Récompense déjà réclamée', orbes: user.orbes, claimed: true });
    }
    // Créditer les orbes
    const reward = uq.quest.reward;
    const user = await User.findById(userId);
    user.orbes += reward;
    await user.save();
    // Marquer comme réclamé
    uq.claimed = true;
    await uq.save();
    return res.json({ success: true, message: `Vous avez reçu ${reward} orbes !`, orbes: user.orbes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;