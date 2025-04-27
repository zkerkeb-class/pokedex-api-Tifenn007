import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pokemon from './models/Pokemon.js'; // Importer le modèle Pokémon

dotenv.config(); // Charger les variables d'environnement

// Connexion à MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connexion à MongoDB réussie');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB :', error.message);
        process.exit(1);
    }
};

// Fonction pour migrer les données depuis le fichier JSON
const migrateData = async () => {
    try {
        // Lire le fichier JSON
        const data = JSON.parse(fs.readFileSync('./src/data/pokemons.json', 'utf-8'));

        // Mapper les données pour correspondre au modèle Mongoose
        const pokemons = data.map(pokemon => ({
            id: pokemon.id,
            name: {
                english: pokemon.name.english,
                japanese: pokemon.name.japanese,
                chinese: pokemon.name.chinese,
                french: pokemon.name.french
            },
            types: pokemon.type.map(type => type.toLowerCase()), // Convertir les types en minuscules
            image: pokemon.image,
            stats: {
                hp: pokemon.base.HP,
                attack: pokemon.base.Attack,
                defense: pokemon.base.Defense,
                specialAttack: pokemon.base['Sp. Attack'],
                specialDefense: pokemon.base['Sp. Defense'],
                speed: pokemon.base.Speed
            }
        }));

        // Supprimer les anciens documents pour éviter les doublons
        await Pokemon.deleteMany({});
        console.log('Anciennes données supprimées');

        // Insérer les Pokémon dans MongoDB
        await Pokemon.insertMany(pokemons);
        console.log('Migration des Pokémon réussie !');
        process.exit();
    } catch (error) {
        console.error('Erreur lors de la migration des données :', error.message);
        process.exit(1);
    }
};

// Exécuter la migration
(async () => {
    await connectDB();
    await migrateData();
})();