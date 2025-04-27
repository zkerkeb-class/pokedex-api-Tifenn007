import mongoose from 'mongoose';
import Pokemon from './models/Pokemon.js'; // Assurez-vous que le chemin est correct
import dotenv from 'dotenv';

dotenv.config(); // Charger les variables d'environnement

// Connexion à la base de données
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

// Fonction pour calculer le prix en fonction des stats
const calculatePrice = (stats) => {
    const totalStats = stats.hp + stats.attack + stats.defense + stats.specialAttack + stats.specialDefense + stats.speed;

    if (totalStats < 200) {
        return 5;   // Prix très bas pour les Pokémon très faibles
    } else if (totalStats < 300) {
        return 15;  // Prix bas pour les Pokémon faibles
    } else if (totalStats < 400) {
        return 30;  // Prix moyen pour les Pokémon moyens
    } else if (totalStats < 500) {
        return 50;  // Prix moyen-haut pour les Pokémon un peu plus forts
    } else if (totalStats < 600) {
        return 75;  // Prix élevé pour les Pokémon forts
    } else {
        return 100; // Prix très élevé pour les Pokémon très forts
    }
};

// Script pour mettre à jour les prix
const updatePokemonPrices = async () => {
    try {
        const pokemons = await Pokemon.find();

        for (const pokemon of pokemons) {
            const price = calculatePrice(pokemon.stats);
            pokemon.price = price; // Met à jour le prix
            await pokemon.save(); // Sauvegarde les modifications
            console.log(`Mise à jour du prix pour ${pokemon.name.english}: ${price}`);
        }

        console.log('Mise à jour des prix terminée');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des prix', error);
    } finally {
        mongoose.connection.close(); // Ferme la connexion à la base de données
    }
};

// Exécute le script
const runScript = async () => {
    await connectDB(); // Connexion à la base de données
    await updatePokemonPrices(); // Mise à jour des prix
};

runScript();