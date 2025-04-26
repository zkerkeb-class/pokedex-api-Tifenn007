// On importe la bibliothèque 'jsonwebtoken' qui permet de gérer les tokens JWT
import jwt from 'jsonwebtoken';

// Cette fonction middleware va vérifier si l'utilisateur a bien envoyé un token JWT valide
const verifyToken = (req, res, next) => {
  // On récupère le token dans le header 'Authorization' de la requête HTTP
  // Le token est généralement envoyé sous la forme "Bearer <token>", donc on enlève "Bearer "
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Token reçu :', token);

  // Si aucun token n'est trouvé, on renvoie une erreur 401 (non autorisé)
  if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
  }

  try {
      // On vérifie et on décode le token avec la clé secrète (stockée dans les variables d'environnement)
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log('Token décodé :', decoded);

      // On ajoute les informations du token à la requête pour les utiliser plus tard (ex : userId, role)
      req.user = decoded;           // Toutes les infos du token
      req.userId = decoded.userId;  // On expose aussi userId pour d'autres routes

      // Si tout est bon, on passe au middleware ou à la route suivante
      next();
  } catch (error) {
      // Si le token est invalide ou expiré, on renvoie une erreur 401
      console.error('Erreur lors de la vérification du token :', error.message);
      return res.status(401).json({ message: 'Token invalide' });
  }
};

// On exporte la fonction pour pouvoir l'utiliser dans d'autres fichiers (ex : dans les routes)
export default verifyToken;
