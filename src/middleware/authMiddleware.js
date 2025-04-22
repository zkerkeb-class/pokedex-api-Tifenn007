import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extraire le token du header
  console.log('Token reçu :', token);

  if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Vérifier la validité du token
      console.log('Token décodé :', decoded);
      req.user = decoded;                           // infos du token (userId et role)
      req.userId = decoded.userId;                  // ← on expose aussi userId pour la route /me
      next();                                       // Passer à la suite
  } catch (error) {
      console.error('Erreur lors de la vérification du token :', error.message);
      return res.status(401).json({ message: 'Token invalide' });
  }
};

export default verifyToken;
