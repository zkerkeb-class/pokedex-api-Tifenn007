// Fichier des routes d'authentification (inscription, connexion, etc.)
import express from 'express';
import jwt from 'jsonwebtoken'; // Pour générer et vérifier les tokens JWT
import User from '../models/User.js'; // Modèle utilisateur
import verifyToken from '../middleware/authMiddleware.js'; // Middleware pour vérifier le token
import checkRole from '../middleware/roleMiddleware.js'; // Middleware pour vérifier le rôle
import Quest from '../models/Quest.js'; // Modèle de quête
import UserQuest from '../models/UserQuest.js'; // Modèle de progression de quête

const router = express.Router(); // Création du routeur Express

// Inscription d'un nouvel utilisateur (accessible à tous)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // Récupère les infos du corps de la requête

    // Vérifie si l'email existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Crée un nouvel utilisateur avec un rôle par défaut 'user'
    user = new User({
      username,
      email,
      password,
      orbes: 10, // Orbes de départ
      role: role || 'user'
    });

    await user.save(); // Sauvegarde en base

    // Génère un token JWT pour l'utilisateur
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Retourne le token et les infos principales
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

// Inscription d'un admin (nécessite d'être connecté en tant qu'admin)
router.post('/register/admin', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifie si l'email existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Crée un nouvel utilisateur avec le rôle 'admin'
    user = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await user.save();

    // Génère un token JWT pour l'admin
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

// Connexion d'un utilisateur (login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Récupère email et mot de passe

    // Cherche l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifie le mot de passe avec la méthode du modèle
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Met à jour la progression de la quête "connexion" si elle existe
    const connexionQuest = await Quest.findOne({ key: 'connexion', active: true });
    if (connexionQuest) {
      const uq = await UserQuest.findOneAndUpdate(
        { user: user._id, quest: connexionQuest._id },
        { $inc: { progress: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      if (!uq.completed && uq.progress >= connexionQuest.target) {
        uq.completed = true;
        await uq.save();
      }
    }

    // Met à jour la date de dernière connexion et le compteur
    user.derConnect = new Date();
    user.nbConnexions = (user.nbConnexions || 0) + 1;
    await user.save();

    // Génère un token JWT pour la session
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Retourne le token et les infos principales
    return res.json({
      success: true,
      message: 'Connexion réussie !',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        orbes: user.orbes,
        dateDerRecomp: user.dateDerRecomp,
        derConnect: user.derConnect,
        nbConnexions: user.nbConnexions
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la connexion. Veuillez réessayer.' 
    });
  }
});

export default router;