import express from "express";
import cors from "cors";
import fs, { stat } from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Lire le fichier JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pokemonsList = JSON.parse(fs.readFileSync(path.join(__dirname, './data/pokemons.json'), 'utf8'));

const app = express();
const PORT = 3000;

// Middleware pour CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour servir des fichiers statiques
// 'app.use' est utilisé pour ajouter un middleware à notre application Express
// '/assets' est le chemin virtuel où les fichiers seront accessibles
// 'express.static' est un middleware qui sert des fichiers statiques
// 'path.join(__dirname, '../assets')' construit le chemin absolu vers le dossier 'assets'
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Route GET de base
app.get("/api/pokemons", (req, res) => {
  res.status(200).send({
    types: [
      "fire",
      "water",
      "grass",
      "electric",
      "ice",
      "fighting",
      "poison",
      "ground",
      "flying",
      "psychic",
      "bug",
      "rock",
      "ghost",
      "dragon",
      "dark",
      "steel",
      "fairy",
    ],
    pokemons: pokemonsList,
  });
});

app.get("/api/pokemons/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const pokemon = pokemonsList.find((pokemon) => pokemon.id === id);

  if (pokemon) {
    res.status(200).send({
      status: 200,
      data: pokemon
    });
  } else {
    res.status(404).send({
      status: 404,
      message: "Pokemon non trouvé"
    });
  }
});

app.post("/api/newpok", (req, res) => {
  const newPokemon = req.body;
  pokemonsList.push(newPokemon);
  fs.writeFileSync(path.join(__dirname, './data/pokemons.json'), JSON.stringify(pokemonsList), 'utf8');
  res.status(201).send(newPokemon);
});
//uptade
app.put("/api/pokemons/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updatedPokemon = req.body;
  const pokemonIndex = pokemonsList.findIndex((pokemon) => pokemon.id === id);

  // Validation des données
  if (!updatedPokemon.id || !updatedPokemon.name || !updatedPokemon.type || !updatedPokemon.base) {
    return res.status(400).send({
      status: 400,
      message: "Les informations du Pokémon sont incomplètes"
    });
  }

  if (pokemonIndex !== -1) {
    pokemonsList[pokemonIndex] = updatedPokemon;
    fs.writeFileSync(path.join(__dirname, './data/pokemons.json'), JSON.stringify(pokemonsList), 'utf8');
    res.status(200).send(updatedPokemon);
  } else {
    res.status(404).send({
      status: 404,
      message: "Pokemon non trouvé"
    });
  }
});

app.delete("/api/pokemons/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const pokemonIndex = pokemonsList.findIndex((pokemon) => pokemon.id === id);

  if (pokemonIndex !== -1) {
    pokemonsList.splice(pokemonIndex, 1);
    fs.writeFileSync(path.join(__dirname, './data/pokemons.json'), JSON.stringify(pokemonsList), 'utf8');
    res.status(204).send();
  } else {
    res.status(404).send({
      status: 404,
      message: "Pokemon non trouvé"
    });
  }
});

app.get("/", (req, res) => {
  res.send("bienvenue sur l'API Pokémon");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
