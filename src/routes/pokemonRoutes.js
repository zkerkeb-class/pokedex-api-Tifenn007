import express from 'express';
import Pokemon from '../models/Pokemon.js';
import verifyToken from '../middleware/authMiddleware.js';
import checkRole from '../middleware/roleMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// Configuration Multer pour stocker les images dans assets/pokemons
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../assets/pokemons')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { type, name, orderBy = 'id' } = req.query;

    let filter = {};
    if (type) filter.types = type; 
    if (name) filter.name = new RegExp(name, 'i'); 

    const pokemons = await Pokemon.find(filter)
      .sort({ [orderBy]: 1 }) 
      .select('id name types image price'); 

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

// POST - Créer un nouveau pokémon (multipart/form-data ou JSON)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Récupérer et parser les champs du body (JSON ou multipart)
    const body = req.body;
    const id = Number(body.id);
    const name = typeof body.name === 'string' ? JSON.parse(body.name) : body.name;
    const typesArray = Array.isArray(body.types)
      ? body.types
      : typeof body.types === 'string'
        ? body.types.split(',').map(t => t.trim())
        : [];
    const stats = typeof body.stats === 'string' ? JSON.parse(body.stats) : body.stats;
    const price = Number(body.price);
    const evol = body.evolutions
      ? (typeof body.evolutions === 'string' ? JSON.parse(body.evolutions) : body.evolutions)
      : [];

    // Vérifier unicité
    const exists = await Pokemon.findOne({ id });
    if (exists) {
      return res.status(400).json({ message: 'Un pokémon avec cet ID existe déjà' });
    }

    // Gérer l'image (upload ou URL)
    let imageUrl;
    if (req.file) {
      imageUrl = `/assets/pokemons/${req.file.filename}`;
    } else if (body.image) {
      imageUrl = body.image;
    } else {
      return res.status(400).json({ message: 'Image manquante' });
    }

    // Créer le document
    const pokemon = new Pokemon({
      id,
      name,
      types: typesArray,
      stats,
      price,
      evolutions: evol,
      image: imageUrl
    });
    await pokemon.save();
    return res.status(201).json(pokemon);
  } catch (error) {
    return res.status(400).json({ message: 'Erreur lors de la création du pokémon', error: error.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    // Récupérer et parser les champs du body (JSON ou multipart)
    const body = req.body;
    const id = Number(body.id);
    const name = typeof body.name === 'string' ? JSON.parse(body.name) : body.name;
    const typesArray = Array.isArray(body.types)
      ? body.types
      : typeof body.types === 'string'
        ? body.types.split(',').map(t => t.trim())
        : [];
    const stats = typeof body.stats === 'string' ? JSON.parse(body.stats) : body.stats;
    const price = Number(body.price);
    const evol = body.evolutions
      ? (typeof body.evolutions === 'string' ? JSON.parse(body.evolutions) : body.evolutions)
      : [];

    // Gérer l'image (upload ou garder l'ancienne)
    let imageUrl;
    if (req.file) {
      imageUrl = `/assets/pokemons/${req.file.filename}`;
    } else if (body.image) {
      imageUrl = body.image;
    }

    // Mettre à jour le document
    const updated = await Pokemon.findByIdAndUpdate(
      req.params.id,
      {
        id,
        name,
        types: typesArray,
        stats,
        price,
        evolutions: evol,
        image: imageUrl
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Pokémon non trouvé' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Erreur lors de la mise à jour du pokémon', error: error.message });
  }
});

// DELETE - Supprimer un pokémon (admin seulement)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    // On supprime par l'_id MongoDB
    const deletedPokemon = await Pokemon.findByIdAndDelete(req.params.id);
    if (!deletedPokemon) {
      return res.status(404).json({
        success: false,
        message: "Pokémon non trouvé"
      });
    }

    // Suppression de l'image associée si elle existe
    if (deletedPokemon.image && deletedPokemon.image.startsWith('/assets/pokemons/')) {
      const imagePath = path.join(__dirname, '../../', deletedPokemon.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression de l'image :", err.message);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Pokémon et image supprimés avec succès",
      pokemon: deletedPokemon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du pokémon",
      error: error.message
    });
  }
});

export default router;
