import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Assurez-vous d'importer correctement votre modèle

const router = express.Router();

// Route pour l'inscription des utilisateurs
router.post('/register', async (req, res) => {
  const { email, nom, motDePasse, role } = req.body;

  // Vérifier que tous les champs requis sont présents
  if (!email || !nom || !motDePasse) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
  }

  try {
      // Vérifier si l'utilisateur existe déjà
      const userExists = await User.findOne({ email });
      if (userExists) {
          return res.status(400).json({ message: 'Utilisateur déjà existant' });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(motDePasse, 10);

      // Normaliser le rôle
      const roleNormalized = role ? role.toLowerCase() : 'user';

      // Créer un nouvel utilisateur
      const newUser = new User({
          email,
          nom,
          motDePasse: hashedPassword,
          role: roleNormalized,
      });

      // Sauvegarder l'utilisateur
      await newUser.save();
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
      console.error('Erreur lors de l\'inscription :', error.message);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Route pour la connexion des utilisateurs
router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  console.log('Requête reçue avec :', email, motDePasse);

  try {
      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      console.log('Utilisateur trouvé :', user);

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
      console.log('Mot de passe valide ?', isPasswordValid);

      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Mot de passe incorrect' });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET_KEY, // Utiliser JWT_SECRET_KEY
        { expiresIn: '1h' }
    );

      res.status(200).json({ token });
  } catch (error) {
      console.error('Erreur serveur :', error.message);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

export default router;  // Assurez-vous d'utiliser export default ici
