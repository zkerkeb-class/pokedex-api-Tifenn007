import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import verifyToken from '../middleware/authMiddleware.js';
import checkRole from '../middleware/roleMiddleware.js';

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Créer un nouvel utilisateur
    user = new User({
      username,
      email,
      password,
      orbes: 10,
      role: role || 'user' // Utilise le rôle fourni ou 'user' par défaut
    });

    await user.save();

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Bienvenue sur notre plateforme.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        orbes: user.orbes
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'inscription. Veuillez réessayer.' 
    });
  }
});

// Route d'inscription admin (protégée)
router.post('/register/admin', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Créer un nouvel utilisateur admin
    user = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await user.save();

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte admin créé avec succès !',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création du compte admin. Veuillez réessayer.' 
    });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie ! Bienvenue de retour.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        orbes: user.orbes
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la connexion. Veuillez réessayer.' 
    });
  }
});

export default router;