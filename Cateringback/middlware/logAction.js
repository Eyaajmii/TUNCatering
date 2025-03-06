// middleware/logAction.js
const logAction = (req, res, next) => {
    const user = req.user ? req.user.email : 'Invité'; // Vérifie si l'utilisateur est authentifié
    console.log(`Action réalisée par : ${user}`);
    console.log(`Méthode : ${req.method}, URL : ${req.originalUrl}`);
    console.log(`Corps de la requête :`, req.body);
    console.log('---'); // Séparateur pour chaque action
    next();
};

module.exports = logAction;
