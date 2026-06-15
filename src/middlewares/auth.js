const jwt = require('jsonwebtoken');

const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant. Accès refusé." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide ou expiré." });
    }

    req.user = user; //Ajoute user dans req
    next();
  });
};

const verifierRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Accès refusé. Vous n\'avez pas les droits nécessaires.'
      });
    }
    next();
  };
};



module.exports = { verifierToken, verifierRole };