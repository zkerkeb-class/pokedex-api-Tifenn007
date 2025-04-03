import express from 'express';
import Pokemon from '../models/Pokemon.js';

const router = express.Router();

// GET - Récupérer tous les pokémons avec filtres, tri et pagination
router.get('/', async (req, res) => {
  try {
    const { type, name, page = 1, limit = 10, orderBy = 'id' } = req.query;

    // Construire l'objet de filtre
    let filter = {};
    if (type) filter.types = type; // Filtre par type
    if (name) filter.name = new RegExp(name, 'i'); // Filtre par nom (insensible à la casse)

    // Convertir `page` et `limit` en nombres
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Récupération des pokémons avec filtres et pagination
    const pokemons = await Pokemon.find(filter)
      .sort({ [orderBy]: 1 }) // Tri par défaut croissant
      .skip(skip)
      .limit(limitNumber)
      .select('id name types image'); // Projection : récupérer uniquement certains champs

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
    const pokemon = await Pokemon.findOne({ id: req.params.id });
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    const deletedPokemon = await Pokemon.findOneAndDelete({ id: req.params.id });
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
