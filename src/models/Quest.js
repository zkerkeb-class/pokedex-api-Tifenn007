// Modèle de quête pour MongoDB
import mongoose from 'mongoose';

// Définition du schéma de quête
const questSchema = new mongoose.Schema({
  key: { // Type de quête (achat, vente, etc.)
    type: String,
    required: true,
    unique: true,
    enum: ['achat', 'vente', 'connexion'] // on peut ajouter d'autres clés si nécessaire
  },
  name: { // Nom de la quête
    type: String,
    required: true
  },
  target: { // Objectif à atteindre
    type: Number,
    required: true
  },
  reward: { // Récompense à gagner
    type: Number,
    required: true
  },
  active: { // Si la quête est active
    type: Boolean,
    default: true
  },
  resetFrequency: { // Fréquence de réinitialisation
    type: String,
    enum: ['daily', 'weekly', 'never'],
    default: 'never'
  }
});

// Ajout de timestamps (createdAt, updatedAt)
questSchema.set('timestamps', true);

// Création du modèle Quest
const Quest = mongoose.model('Quest', questSchema);

export default Quest; 