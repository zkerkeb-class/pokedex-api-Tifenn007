// Importation des modules nécessaires
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Connexion à la base de données
import authRoutes from './routes/authRoutes.js';  // Routes d'authentification
import pokemonRoutes from './routes/pokemonRoutes.js'; // Routes des pokémons
import userRoutes from './routes/user.js'; // Routes des utilisateurs
import questRoutes from './routes/questRoutes.js'; // Routes des quêtes
import path from "path";
import { fileURLToPath } from "url";

// Chargement des variables d'environnement
dotenv.config();

// Gestion des chemins pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à la base de données MongoDB
connectDB();

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Configuration de CORS pour autoriser les requêtes du frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir les fichiers statiques (images, etc.)
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Définition des routes principales de l'API
app.use('/api/auth', authRoutes);  
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/pokemons', pokemonRoutes);

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Pokémon');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});