// Modèle de progression de quête utilisateur
import mongoose from 'mongoose';

// Définition du schéma UserQuest
const userQuestSchema = new mongoose.Schema({
  user: { // Référence à l'utilisateur
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quest: { // Référence à la quête
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true
  },
  progress: { // Progression de la quête
    type: Number,
    default: 0
  },
  completed: { // Si la quête est terminée
    type: Boolean,
    default: false
  },
  claimed: { // Si la récompense a été récupérée
    type: Boolean,
    default: false
  },
  lastReset: { // Dernière réinitialisation
    type: Date,
    default: Date.now
  }
});

// Index unique pour éviter les doublons user+quest
userQuestSchema.index({ user: 1, quest: 1 }, { unique: true });

// Création du modèle UserQuest
const UserQuest = mongoose.model('UserQuest', userQuestSchema);

export default UserQuest; 