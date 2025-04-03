import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définir le schéma de l'utilisateur
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  nom: {
    type: String,
    required: true,
  },
  motDePasse: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

// Méthode pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

// Méthode pour comparer le mot de passe haché
userSchema.methods.compareMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

// Exporter le modèle
export default mongoose.model('User', userSchema);
