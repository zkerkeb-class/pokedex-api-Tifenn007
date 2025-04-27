# Pokedex API

## Description du projet

Ce projet est une API REST développée avec Node.js et Express.js permettant de gérer un Pokédex interactif.
Elle permet aux utilisateurs de s'inscrire, se connecter, collectionner des Pokémon, réaliser des quêtes, acheter/vendre des Pokémon et obtenir des récompenses quotidiennes.
L'API intègre une gestion des rôles (utilisateur/admin), une authentification sécurisée par JWT, et une gestion des images pour les Pokémon.

---

## Sécurité et Authentification

- **Routes d'authentification (login/register)** :
  Permettent aux utilisateurs de s'inscrire et de se connecter. Les routes `/api/auth/register` et `/api/auth/login` sont utilisées pour créer un compte et obtenir un token d'accès.

- **Génération et validation des JWT** :
  Lors de la connexion ou de l'inscription, un token JWT (JSON Web Token) est généré et envoyé à l'utilisateur. Ce token doit être envoyé dans le header `Authorization` pour accéder aux routes protégées. Le middleware vérifie la validité du token à chaque requête.

- **Middleware de protection des routes** :
  Certaines routes sont protégées par des middlewares (`authMiddleware`, `roleMiddleware`) qui vérifient la présence et la validité du token, ainsi que le rôle de l'utilisateur (user/admin).

- **Stockage sécurisé des mots de passe** :
  Les mots de passe sont automatiquement hashés avant d'être stockés en base de données grâce à la librairie `bcryptjs`. Ainsi, même en cas de fuite de la base, les mots de passe restent protégés.

---

## Instructions d'installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd pokedex-api-Tifenn007
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   - Crée un fichier `.env` à la racine du projet avec au minimum :
     ```
     JWT_SECRET_KEY=une_chaine_secrete
     MONGODB_URI=mongodb://localhost:27017/pokedex
     PORT=3000
     ```
   - Adapte les valeurs selon ta configuration.

4. **Lancer le serveur**
   ```bash
   npm start
   ```
   Le serveur sera accessible sur `http://localhost:3000`.

---

## Documentation de l'API

### Authentification

- **POST /api/auth/register**  
  Inscription d'un nouvel utilisateur  
  Corps attendu : `{ username, email, password }`

- **POST /api/auth/login**  
  Connexion d'un utilisateur  
  Corps attendu : `{ email, password }`  
  Retourne un token JWT à utiliser dans le header `Authorization`.

- **POST /api/auth/register/admin**  
  Création d'un compte admin (nécessite d'être connecté en tant qu'admin)

---

### Utilisateur

- **GET /api/user/me**  
  Récupère les informations du profil de l'utilisateur connecté.

- **POST /api/user/me/buy/:pokemonId**  
  Acheter un Pokémon (rôle `user` requis).

- **POST /api/user/me/sell/:pokemonId**  
  Vendre un Pokémon (rôle `user` requis).

- **POST /api/user/me/daily-reward**  
  Récupérer la récompense quotidienne.

- **GET /api/user/me/quests**  
  Voir la progression des quêtes.

- **POST /api/user/me/quests/:id/claim**  
  Récupérer la récompense d'une quête terminée.

---

### Pokémon

- **GET /api/pokemons**  
  Liste tous les Pokémon (filtres possibles : `type`, `name`).

- **GET /api/pokemons/:id**  
  Détail d'un Pokémon par son ID.

- **POST /api/pokemons**  
  Créer un nouveau Pokémon (admin ou interface de gestion, upload d'image possible).

- **PUT /api/pokemons/:id**  
  Modifier un Pokémon.

- **DELETE /api/pokemons/:id**  
  Supprimer un Pokémon (admin uniquement).

---

### Quêtes

- **POST /api/quests**  
  Créer une nouvelle quête (admin uniquement).

- **GET /api/quests**  
  Lister les quêtes (admin : toutes, user : progression personnelle).

- **PUT /api/quests/:id**  
  Modifier une quête (admin uniquement).

- **DELETE /api/quests/:id**  
  Supprimer une quête (admin uniquement).

- **PATCH /api/quests/:id/deactivate**  
  Désactiver une quête (admin uniquement).

- **PATCH /api/quests/:id/activate**  
  Réactiver une quête (admin uniquement).

---

### Gestion des fichiers statiques

Les images des Pokémon sont accessibles via :  
```
http://localhost:3000/assets/pokemons/{id}.png
```

---

## Remarques

- utiliser le header `Authorization: Bearer <token>` pour toutes les routes protégées.

