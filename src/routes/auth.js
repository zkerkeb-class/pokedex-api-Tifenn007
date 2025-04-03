import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Assurez-vous d'importer correctement votre modèle

const router = express.Router();

// Route pour l'inscription des utilisateurs
router.post('/register', async (req, res) => {
    const { email, nom, motDePasse, role } = req.body;
  
    try {
      // Vérifier si l'utilisateur existe déjà
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'Utilisateur déjà existant' });
      }
  
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
  
      // Créer un nouvel utilisateur
      const newUser = new User({
        email,
        nom,
        motDePasse: hashedPassword,  // Utilisez le mot de passe haché
        role,
      });
  
      // Sauvegarder l'utilisateur
      await newUser.save();
  
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  });

// Route pour la connexion des utilisateurs
router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparer les mots de passe
    const isMatch = await user.compareMotDePasse(motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Générer un JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

export default router;  // Assurez-vous d'utiliser export default ici
