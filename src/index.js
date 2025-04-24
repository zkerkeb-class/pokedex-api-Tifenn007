import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';  
import pokemonRoutes from './routes/pokemonRoutes.js'; 
import userRoutes from './routes/user.js';
import questRoutes from './routes/questRoutes.js';
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/assets", express.static(path.join(__dirname, "../assets")));
app.use('/api/auth', authRoutes);  
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/pokemons', pokemonRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Pokémon');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
