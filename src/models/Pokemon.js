// Modèle Pokémon pour MongoDB
import mongoose from 'mongoose';  // Ajoute cette ligne pour importer mongoose

// Définition du schéma Pokémon
const pokemonSchema = new mongoose.Schema({
    id: { // Identifiant unique du Pokémon
      type: Number,
      required: true,
      unique: true
    },
    name: { // Noms du Pokémon dans différentes langues
      type: {
        english: { type: String, required: true },
        japanese: { type: String, required: true },
        chinese: { type: String, required: true },
        french: { type: String, required: true }
      },
      required: true
    },
    types: [{ // Types du Pokémon (ex: feu, eau...)
      type: String,
      enum: [
        "fire", "water", "grass", "electric", "ice", "fighting",
        "poison", "ground", "flying", "psychic", "bug", "rock",
        "ghost", "dragon", "dark", "steel", "fairy", "normal"
      ]
    }],
    image: { // URL de l'image
      type: String
    },
    stats: { // Statistiques du Pokémon
      hp: Number,
      attack: Number,
      defense: Number,
      specialAttack: Number,
      specialDefense: Number,
      speed: Number
    },
    price: { // Prix du Pokémon
      type: Number,
      required: true
    },
    evolutions: [{ // Liste des évolutions (id des autres Pokémon)
      type: Number,
      ref: 'Pokemon'
    }]
    
  }, {
    timestamps: true // Ajoute createdAt et updatedAt
  });
  
  // Création du modèle Pokemon
  const Pokemon = mongoose.model('Pokemon', pokemonSchema);
  
  export default Pokemon;
  