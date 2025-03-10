import express from "express";
import cors from "cors";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import saveJson from "./data/utils/saveJson.js";

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
  console.log(req.params.id);
  const id = parseInt(req.params.id);
  const pokemon = pokemonsList.find((pokemon) => pokemon.id === id);

  if (!pokemon) {
    return res.status(404).send({
      type: "error",
      status: 404,
      message: "Pokemon non trouvé"
    });
  }
  res.status(200).send({
    type: "success",
    status: 200,
    pokemon: pokemon
  });
});

//ajout
app.post("/api/newpok", (req, res) => {
  pokemonsList.push(req.body);
  console.log(req.body);
  saveJson(path.join(__dirname, './data/pokemons.json'), pokemonsList);
  res.status(200).send({
    type: "success",
    status: 200,
    message: "Pokemon ajouté"
  });
});

//update
app.put("/api/pokemons/:id", (req, res) => {
  const pokemon = pokemonsList.find((pokemon) => pokemon.id === parseInt(req.params.id));
  
  if (!pokemon) {
    return res.status(404).send({
      type: "error",
      status: 404,
      message: "Pokemon non trouvé"
    });
  }
  const indexOfPokemon = pokemonsList.indexOf(pokemon);
  console.log("indexOfPokemon", indexOfPokemon);
  pokemonsList.splice(indexOfPokemon, 1, req.body);
  saveJson(path.join(__dirname, './data/pokemons.json'), pokemonsList);
  res.status(200).send({
    type: "success",
    status: 200,
    message: "Pokemon mis à jour"
  });
});

//delete
app.delete("/api/pokemons/:id", (req, res) => {
  console.log(req.params.id);
  const id = parseInt(req.params.id);
  const pokemonIndex = pokemonsList.findIndex((pokemon) => pokemon.id === id);

  if (pokemonIndex === -1) {
    return res.status(404).send({
      type: "error",
      status: 404,
      message: "Pokemon non trouvé"
    });
  }

  pokemonsList.splice(pokemonIndex, 1);
  saveJson(path.join(__dirname, './data/pokemons.json'), pokemonsList);
  res.status(200).send({
    type: "success",
    status: 200,
    message: "Pokemon supprimé"
  });
});

app.get("/", (req, res) => {
  res.send("bienvenue sur l'API Pokémon");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});