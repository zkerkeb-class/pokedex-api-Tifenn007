import express from 'express';
import Pokemon from '../models/Pokemon.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, name, orderBy = 'id' } = req.query;

    let filter = {};
    if (type) filter.types = type; 
    if (name) filter.name = new RegExp(name, 'i'); 

    const pokemons = await Pokemon.find(filter)
      .sort({ [orderBy]: 1 }) 
      .select('id name types image'); 

    res.status(200).json(pokemons);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des pokémons",
      error: error.message
    });
  }
});

// GET - Récupérer un pokémon par son ID
router.get('/:id', async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id); // Recherche par id numérique
    if (!pokemon) {
      return res.status(404).json({ message: "Pokémon non trouvé" });
    }
    res.status(200).json(pokemon);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du pokémon",
      error: error.message
    });
  }
});

// POST - Créer un nouveau pokémon
router.post('/', verifyToken, async (req, res) => {
  try {
    const existingPokemon = await Pokemon.findOne({ id: req.body.id });
    if (existingPokemon) {
      return res.status(400).json({ message: "Un pokémon avec cet ID existe déjà" });
    }
    const newPokemon = new Pokemon(req.body);
    await newPokemon.save();
    res.status(201).json(newPokemon);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création du pokémon",
      error: error.message
    });
  }
});

// PUT - Mettre à jour un pokémon
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedPokemon = await Pokemon.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPokemon) {
      return res.status(404).json({ message: "Pokémon non trouvé" });
    }
    res.status(200).json(updatedPokemon);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour du pokémon",
      error: error.message
    });
  }
});

// DELETE - Supprimer un pokémon
router.delete('/:id', verifyToken, async (req, res) => {
  try {
      const id = parseInt(req.params.id, 10); // Convertir l'ID en nombre
      if (isNaN(id)) {
          return res.status(400).json({ message: "ID invalide" });
      }

      const deletedPokemon = await Pokemon.findOneAndDelete({ id });
      if (!deletedPokemon) {
          return res.status(404).json({ message: "Pokémon non trouvé" });
      }
      res.status(200).json({
          message: "Pokémon supprimé avec succès",
          pokemon: deletedPokemon
      });
  } catch (error) {
      res.status(500).json({
          message: "Erreur lors de la suppression du pokémon",
          error: error.message
      });
  }
});

export default router;
