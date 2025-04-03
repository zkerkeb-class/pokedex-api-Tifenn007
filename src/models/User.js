import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définir le schéma utilisateur
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// Méthode pour comparer les mots de passe
userSchema.methods.compareMotDePasse = async function (motDePasse) {
    return await bcrypt.compare(motDePasse, this.motDePasse);
};

// Créer le modèle utilisateur
const User = mongoose.model('User', userSchema);

export default User;