// Cette fonction middleware permet de vérifier si l'utilisateur a le bon rôle pour accéder à une ressource
const checkRole = (roles) => {
    // On retourne une fonction middleware qui prend req, res, next en paramètres
    return (req, res, next) => {
        // Si l'utilisateur n'est pas authentifié (pas de req.user), on refuse l'accès
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé - Token manquant'
            });
        }

        // Si le rôle de l'utilisateur n'est pas dans la liste des rôles autorisés, on refuse l'accès
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Vous n\'avez pas les droits nécessaires'
            });
        }

        // Si tout est bon, on passe au middleware ou à la route suivante
        next();
    };
};

// On exporte la fonction pour l'utiliser dans les routes qui nécessitent une vérification de rôle
export default checkRole; 