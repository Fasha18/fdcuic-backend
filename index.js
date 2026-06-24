require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

const logs = [];
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => {
  logs.push(`[LOG] ${args.join(' ')}`);
  originalLog(...args);
};
console.error = (...args) => {
  logs.push(`[ERR] ${args.join(' ')}`);
  originalError(...args);
};

app.get('/api/debug-logs', (req, res) => {
  res.send(logs.join('\n'));
});


// ── CORS explicite — Railway exige des headers manuels pour le preflight OPTIONS ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// ── Middlewares globaux ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');

// ── Création du dossier uploads s'il n'existe pas (pour Railway) ──
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

  // Route publique — téléchargement des templates (sans authentification)
  const { telecharger } = require('./src/controllers/documentTemplateController');
  app.get('/api/templates/download/:nom_document', telecharger);

  console.log('Toutes les routes chargées avec succès.');
} catch (err) {
  console.error('ERREUR CHARGEMENT ROUTES:', err.message);
}

// ── Route cachée pour exécuter le seeder en production ──
app.get('/api/run-seeder', async (req, res) => {
  try {
    const { sequelize } = require('./src/models/index');
    await sequelize.authenticate();
    await sequelize.sync();
    
    // Insérer les secteurs et types
    const SecteurActivite = require('./src/models/SecteurActivite');
    const TypeProjet = require('./src/models/TypeProjet');
    await SecteurActivite.bulkCreate([
      { code: 'claque',        nom: 'Claque',         icone: 'music_note' },
      { code: 'danse_urbaine', nom: 'Danse urbaine',  icone: 'theater_comedy' },
      { code: 'conception',    nom: 'Conception',     icone: 'directions_run' },
      { code: 'sport_de_rue',  nom: 'Sport de rue',   icone: 'palette' },
      { code: 'art_vivant',    nom: 'Art vivant',     icone: 'book' },
      { code: 'mode',          nom: 'Mode',           icone: 'movie' },
      { code: 'hiphop',        nom: 'Hip-hop',        icone: 'landscape' },
      { code: 'graffiti',      nom: 'Graffiti',       icone: 'celebration' },
    ], { ignoreDuplicates: true });
    
    await TypeProjet.bulkCreate([
      { code: 'structuration', label: 'Structuration', nb_etapes: 4 },
      { code: 'formation',     label: 'Formation',     nb_etapes: 4 },
      { code: 'evenementiel',  label: 'Événementiel',  nb_etapes: 4 },
      { code: 'mobilite',      label: 'Mobilité',      nb_etapes: 3 },
    ], { ignoreDuplicates: true });

    // Insérer les templates
    const DocumentTemplate = require('./src/models/DocumentTemplate');
    await DocumentTemplate.bulkCreate([
      { type_projet_code: 'structuration', nom_document: 'Business Model Canvas', obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'structuration', nom_document: 'Budget prévisionnel', obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'structuration', nom_document: 'Analyse financière', obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'formation', nom_document: 'Budget prévisionnel', obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'evenementiel', nom_document: 'Budget prévisionnel', obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'mobilite', nom_document: 'Budget prévisionnel', obligatoire: true, section_etape: 'etape_3' }
    ], { ignoreDuplicates: true });

    res.json({ success: true, message: 'Seeder exécuté avec succès.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Gestion des erreurs ──

const PORT = parseInt(process.env.PORT, 10) || 8000;

// IMPORTANT : Démarrer le serveur HTTP IMMÉDIATEMENT, puis connecter la DB après
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'non défini');
  console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL);

  // removed self ping
});

// Connecter la base de données en arrière-plan (ne bloque PAS le serveur)
(async () => {
  try {
    const { sequelize } = require('./src/models/index');
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie !');
    // La synchronisation est supprimée en production pour éviter les blocages
    // await sequelize.sync({ force: false, alter: true });
    console.log('DB authentifiée avec succès !');
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