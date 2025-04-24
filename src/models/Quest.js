import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['achat', 'vente', 'connexion'] // on peut ajouter d'autres clés si nécessaire
  },
  name: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  resetFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'never'],
    default: 'never'
  }
});

// Ajout de timestamps (createdAt, updatedAt)
questSchema.set('timestamps', true);

const Quest = mongoose.model('Quest', questSchema);

export default Quest; 