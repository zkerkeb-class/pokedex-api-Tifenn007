// Modèle utilisateur pour MongoDB
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définition du schéma utilisateur
const userSchema = new mongoose.Schema({
  username: { // Nom d'utilisateur unique
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: { // Email unique
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { // Mot de passe (sera hashé)
    type: String,
    required: true,
    minlength: 6
  },
  role: { // Rôle de l'utilisateur
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: { // Date de création
    type: Date,
    default: Date.now
  },
  orbes: { // Monnaie du jeu
    type: Number,
    default: 10
  },
  pokemons: [ // Liste des Pokémons possédés
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pokemon'
    }
  ],
  dateDerRecomp: { // Date de dernière récompense
    type: Date
  },
  derConnect: { // Date de dernière connexion
    type: Date
  },
  nbachats: { // Nombre d'achats
    type: Number,
    default: 0
  },
  nbventes: { // Nombre de ventes
    type: Number,
    default: 0
  },
  nbConnexions: { // Nombre de connexions
    type: Number,
    default: 0
  }
});

// Hash le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Création du modèle User
const User = mongoose.model('User', userSchema);

export default User; 