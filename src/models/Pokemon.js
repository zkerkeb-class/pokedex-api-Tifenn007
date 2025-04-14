import mongoose from 'mongoose';  // Ajoute cette ligne pour importer mongoose

const pokemonSchema = new mongoose.Schema({
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: {
        english: { type: String, required: true },
        japanese: { type: String, required: true },
        chinese: { type: String, required: true },
        french: { type: String, required: true }
      },
      required: true
    },
    types: [{
      type: String,
      enum: [
        "fire", "water", "grass", "electric", "ice", "fighting",
        "poison", "ground", "flying", "psychic", "bug", "rock",
        "ghost", "dragon", "dark", "steel", "fairy", "normal"  // Ajout de 'normal'
      ]
    }],
    image: {
      type: String
    },
    stats: {
      hp: Number,
      attack: Number,
      defense: Number,
      specialAttack: Number,
      specialDefense: Number,
      speed: Number
    },
    price: {
      type: Number,
      required: true
    },
    evolutions: [{
      type: Number,
      ref: 'Pokemon'
    }]
    
  }, {
    timestamps: true
  });
  
  const Pokemon = mongoose.model('Pokemon', pokemonSchema);
  
  export default Pokemon;
  