require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// ── CORS ouvert (accepte les requêtes de partout : mobile, web, etc.) ──
app.use(cors());

// ── Middlewares globaux ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Route de santé (Railway health check) ──
app.get('/', (req, res) => {
  res.json({ message: 'API FDCUIC opérationnelle !' });
});

// ── Routes API ──
try {
  app.use('/api/auth',        require('./src/routes/auth'));
  app.use('/api/appels',      require('./src/routes/appel'));
  app.use('/api/projets',     require('./src/routes/projet'));
  app.use('/api/evaluations', require('./src/routes/evaluation'));
  app.use('/api/subventions', require('./src/routes/subvention'));
  app.use('/api/notifications', require('./src/routes/notification'));
  app.use('/api/mobilite',    require('./src/routes/mobilite'));
  app.use('/api/dossiers',    require('./src/routes/appelProjet'));
  app.use('/api/admin',       require('./src/routes/admin'));
  app.use('/api/users',       require('./src/routes/user'));
  app.use('/api/secteurs',    require('./src/routes/secteur'));
  app.use('/api/admin/types-projet',  require('./src/routes/typeProjet'));
  app.use('/api/admin/personnel',     require('./src/routes/personnel'));
  app.use('/api/admin/candidats',     require('./src/routes/candidat'));
  app.use('/api/admin/journal',       require('./src/routes/journal'));
  app.use('/api/admin/notifications', require('./src/routes/notificationAdmin'));
  app.use('/api/faqs',        require('./src/routes/faq'));
  app.use('/api/legal',       require('./src/routes/legal'));
  console.log('Toutes les routes chargées avec succès.');
} catch (err) {
  console.error('ERREUR CHARGEMENT ROUTES:', err.message);
}

// ── Démarrage serveur ──
const PORT = process.env.PORT || 3000;

// IMPORTANT : Démarrer le serveur HTTP IMMÉDIATEMENT, puis connecter la DB après
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'non défini');
  console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL);
});

// Connecter la base de données en arrière-plan (ne bloque PAS le serveur)
(async () => {
  try {
    const { sequelize } = require('./src/models/index');
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie !');
    await sequelize.sync({ force: false, alter: true });
    console.log('Tables créées/mises à jour avec succès !');
  } catch (error) {
    console.error('Erreur de connexion DB:', error.message);
    // Le serveur reste UP même si la DB échoue
  }
})();

// Capturer les erreurs non-attrapées pour éviter les crashs silencieux
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});