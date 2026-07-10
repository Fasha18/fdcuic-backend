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

app.get('/api/admin/force-fix', async (req, res) => {
  try {
    const { sequelize } = require('./src/models/index');
    await sequelize.query(`ALTER TABLE appels_projets ALTER COLUMN secteur_activite TYPE VARCHAR(255) USING secteur_activite::VARCHAR;`);
    return res.send('<h1>FIX APPLIED SUCCESSFULLY</h1><p>You can now use the mobile app.</p>');
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Proxy universel pour forcer l'affichage inline (désactive le forçage de téléchargement de Cloudinary)
app.get(['/api/proxy-file', '/api/proxy-file/:filename'], async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL manquante');
    
    const https = require('https');
    
    https.get(url, (fileRes) => {
      // Reprendre le Content-Type original ou fallback sur octet-stream
      const contentType = fileRes.headers['content-type'] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      fileRes.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy File HTTPS Error:', err.message);
      res.status(500).send('Erreur HTTPS: ' + err.message);
    });
    
  } catch (error) {
    const status = error.response ? error.response.status : 'N/A';
    const msg = error.message;
    console.error('Proxy PDF Error:', msg, 'Status:', status, 'URL:', req.query.url);
    res.status(500).send(`Erreur lors de la récupération du PDF.<br/>URL: ${req.query.url}<br/>Status: ${status}<br/>Détail: ${msg}`);
  }
});

app.get('/api/admin/check-schema', async (req, res) => {
  try {
    const { sequelize } = require('./src/models/index');
    const result = await sequelize.query(`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'appels_projets' AND column_name = 'secteur_activite';`);
    res.json(result[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/debug-logs', async (req, res) => {
  try {
    const logFile = path.join(__dirname, 'logs.txt');
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      const logs = content.split('\n').filter(l => l.trim().length > 0);
      res.json({ logs });
    } else {
      res.json({ logs: ['Aucun log disponible.'] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});


// ── CORS — Origines autorisées ────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:3000',   // Dev local
  'https://fdcuic-backend-production.up.railway.app', // Railway prod
  process.env.FRONTEND_URL,  // Domaine frontend custom (ex: https://mon-site.com)
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // En dev on autorise tout, en prod on vérifie la whitelist
  if (process.env.NODE_ENV !== 'production' || !origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// ── Middlewares globaux ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  app.use('/api/me',          require('./src/routes/me'));
  app.use('/api/secteurs',    require('./src/routes/secteur'));
  app.use('/api/admin/types-projet',  require('./src/routes/typeProjet'));
  app.use('/api/admin/personnel',     require('./src/routes/personnel'));
  app.use('/api/admin/candidats',     require('./src/routes/candidat'));
  app.use('/api/admin/journal',       require('./src/routes/journal'));
  app.use('/api/admin/notifications', require('./src/routes/notificationAdmin'));
  app.use('/api/faqs',        require('./src/routes/faq'));
  app.use('/api/legal',       require('./src/routes/legal'));
  app.use('/api/referentiels', require('./src/routes/referentiels'));

  // Routes publiques — téléchargement des documents modèles (sans authentification)
  const { telechargerDocumentModele, getDocumentsModelesParType } = require('./src/controllers/documentModeleController');
  app.get('/api/types-projet/:id/documents-modeles', getDocumentsModelesParType);
  app.get('/api/documents-modeles/:docId/telecharger', telechargerDocumentModele);

  console.log('Toutes les routes chargées avec succès.');
} catch (err) {
  console.error('ERREUR CHARGEMENT ROUTES:', err.message);
}

// ── Route cachée pour exécuter le seeder en production ──
app.get('/api/run-seeder', async (req, res) => {
  try {
    const { sequelize } = require('./src/models/index');
    await sequelize.authenticate();
    
    // NUCLEAR RESET: Drop and recreate schema fresh
    await sequelize.query('DROP SCHEMA public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO PUBLIC;');
    
    // Sync all models (creates ENUMs with mobilite included)
    await sequelize.sync({ force: true });
    
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
    // Insérer les champs de formulaire (Manquant !)
    const ChampFormulaire = require('./src/models/ChampFormulaire');
    const typesCommuns = ['structuration', 'formation', 'evenementiel', 'mobilite'];
    const champsCommuns = [
      { nom_champ: 'doc_ninea_recepisse', label: 'NINEA ou Récépissé',  obligatoire: true,  ordre: 1 },
      { nom_champ: 'doc_cni_passeport',   label: 'CNI ou Passeport',    obligatoire: true,  ordre: 2 },
      { nom_champ: 'doc_plan_action',     label: "Plan d'action",       obligatoire: false, ordre: 3 },
      { nom_champ: 'doc_photo_prototype', label: 'Photo ou Prototype',  obligatoire: false, ordre: 4 },
    ];
    const champsACreer = [];
    for (const type of typesCommuns) {
      for (const champ of champsCommuns) {
        champsACreer.push({ type_projet: type, type_champ: 'fichier', ...champ });
      }
    }
    await ChampFormulaire.bulkCreate(champsACreer, { ignoreDuplicates: true });
    // Insérer les templates
    const DocumentTemplate = require('./src/models/DocumentTemplate');
    await DocumentTemplate.bulkCreate([
      { type_projet_code: 'structuration', nom_document: 'business_model_canvas',  label: 'Business Model Canvas',  obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'structuration', nom_document: 'budget_previsionnel',    label: 'Budget prévisionnel',    obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'structuration', nom_document: 'analyse_financiere',     label: 'Analyse financière',     obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'formation',     nom_document: 'budget_previsionnel',    label: 'Budget prévisionnel',    obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'evenementiel',  nom_document: 'budget_previsionnel',    label: 'Budget prévisionnel',    obligatoire: true, section_etape: 'etape_4' },
      { type_projet_code: 'mobilite',      nom_document: 'budget_previsionnel',    label: 'Budget prévisionnel',    obligatoire: true, section_etape: 'etape_3' }
    ], { ignoreDuplicates: true });

    // Créer l'admin par défaut
    const User = require('./src/models/User');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin1234', salt);
    await User.create({
      nom: 'Admin',
      prenom: 'FDCUIC',
      email: 'admin@fdcuic.sn',
      mot_de_passe_hash: hashedPassword,
      role: 'admin',
      est_active: true
    });

    res.json({ success: true, message: 'Base de données réinitialisée et Seeder exécuté avec succès.' });
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
    const { sequelize, User } = require('./src/models/index');
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie !');

    // Migration de force : changer ENUM en VARCHAR sur Railway
    try {
      await sequelize.query(`
        ALTER TABLE appels_projets 
        ALTER COLUMN secteur_activite TYPE VARCHAR(255) 
        USING secteur_activite::VARCHAR;
      `);
      console.log('[LOG] Fix ENUM secteur_activite applique sur Railway.');
    } catch (e) {
      console.log('[LOG] Fix ENUM deja applique ou erreur:', e.message);
    }
    // Synchronisation spécifique pour les tables qui ont de nouvelles colonnes
    try {
      const { TypeProjet, AppelProjet, ProjetMobilite, DocumentModele, User } = require('./src/models/index');
      await User.sync({ alter: true });
      await TypeProjet.sync({ alter: true });
      await AppelProjet.sync({ alter: true });
      await ProjetMobilite.sync({ alter: true });
      await DocumentModele.sync({ alter: true });
      console.log('Tables spécifiques synchronisées avec succès (alter: true)');
    } catch (syncErr) {
      console.error('Erreur lors de la synchronisation des tables:', syncErr.message);
    }
    
    // La synchronisation globale est supprimée en production pour éviter les blocages
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