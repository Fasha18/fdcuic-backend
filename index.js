require('dotenv').config();
const express = require('express');
const path = require('path');
const { sequelize } = require('./src/models/index');

// Import des routes
const authRoutes       = require('./src/routes/auth');
const appelRoutes      = require('./src/routes/appel');
const projetRoutes     = require('./src/routes/projet');
const evaluationRoutes = require('./src/routes/evaluation');
const subventionRoutes = require('./src/routes/subvention');
const notificationRoutes = require('./src/routes/notification');
const mobiliteRoutes = require('./src/routes/mobilite');
const appelProjetRoutes = require('./src/routes/appelProjet');
const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/user');
const secteurRoutes         = require('./src/routes/secteur');
const typeProjetRoutes      = require('./src/routes/typeProjet');
const personnelRoutes       = require('./src/routes/personnel');
const candidatRoutes        = require('./src/routes/candidat');
const journalRoutes         = require('./src/routes/journal');
const notifAdminRoutes      = require('./src/routes/notificationAdmin');
const faqRoutes             = require('./src/routes/faq');
const legalRoutes           = require('./src/routes/legal');

const cors = require('cors');
const app = express();

// ── CORS (en premier, avant tout le reste) ──
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Middlewares globaux ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // accès aux images/PDFs


// ── Routes ──
app.use('/api/auth',        authRoutes);
app.use('/api/appels',      appelRoutes);
app.use('/api/projets',     projetRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/subventions', subventionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mobilite', mobiliteRoutes);
app.use('/api/dossiers', appelProjetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/secteurs',              secteurRoutes);
app.use('/api/admin/types-projet',    typeProjetRoutes);
app.use('/api/admin/personnel',       personnelRoutes);
app.use('/api/admin/candidats',       candidatRoutes);
app.use('/api/admin/journal',         journalRoutes);
app.use('/api/admin/notifications',   notifAdminRoutes);
app.use('/api/faqs',                  faqRoutes);
app.use('/api/legal',                 legalRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({ message: 'API FDCUIC opérationnelle !' });
});

// ── Démarrage serveur ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie !');
    await sequelize.sync({ force: false, alter: true });
    console.log('Tables créées/mises à jour avec succès !');
  } catch (error) {
    console.error('Erreur de connexion :', error.message);
  }
});