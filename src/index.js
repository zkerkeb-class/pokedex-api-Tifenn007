import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';  // Importez le fichier authRoutes
import pokemonRoutes from './routes/pokemonRoutes.js'; // Si vous avez d'autres routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à la base de données
connectDB();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Utilisation des routes d'authentification
app.use('/api/auth', authRoutes);  // Assurez-vous que l'URL correspond à celle que vous utilisez pour POST

// Utilisation des autres routes
app.use('/api/pokemons', pokemonRoutes);

// Route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Pokémon');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
