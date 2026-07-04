const sequelize = require('../config/database');
const User = require('./User');
const AppelAProjet = require('./AppelAProjet');
const Projet = require('./Projet');
const Evaluation = require('./Evaluation');
const Subvention = require('./Subvention');
const Notification = require('./Notification');
const ProjetMobilite = require('./ProjetMobilite');
const AppelProjet = require('./AppelProjet');
const SecteurActivite = require('./SecteurActivite');
const TypeProjet = require('./TypeProjet');
const ChampFormulaire = require('./ChampFormulaire');
const ActivityLog = require('./ActivityLog');
const FAQ = require('./FAQ');
const PageLegale = require('./PageLegale');
const DocumentTemplate = require('./DocumentTemplate');
const DocumentModele = require('./DocumentModele');

// User soumet N Projets
User.hasMany(Projet, { foreignKey: 'user_id', as: 'projets' });
Projet.belongsTo(User, { foreignKey: 'user_id', as: 'candidat' });

// AppelAProjet contient N Projets
AppelAProjet.hasMany(Projet, { foreignKey: 'appel_id', as: 'projets' });
Projet.belongsTo(AppelAProjet, { foreignKey: 'appel_id', as: 'appel' });

// Projet → Evaluation (1 à N)
Projet.hasMany(Evaluation, { foreignKey: 'projet_id', as: 'evaluations' });
Evaluation.belongsTo(Projet, { foreignKey: 'projet_id', as: 'projet' });

// User → Evaluation (évaluateur, 1 à N)
User.hasMany(Evaluation, { foreignKey: 'evaluateur_id', as: 'evaluations' });
Evaluation.belongsTo(User, { foreignKey: 'evaluateur_id', as: 'evaluateur' });

// Projet → Subvention (1 à 0..1)
Projet.hasOne(Subvention, { foreignKey: 'projet_id', as: 'subvention' });
Subvention.belongsTo(Projet, { foreignKey: 'projet_id', as: 'projet' });

// User → Notification (1 à N)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'destinataire' });

User.hasMany(ProjetMobilite, { foreignKey: 'user_id', as: 'projets_mobilite' });
ProjetMobilite.belongsTo(User, { foreignKey: 'user_id', as: 'candidat' });

// Relations AppelProjet
User.hasMany(AppelProjet, { foreignKey: 'user_id', as: 'appels_projets' });
AppelProjet.belongsTo(User, { foreignKey: 'user_id', as: 'candidat' });

AppelAProjet.hasMany(AppelProjet, { foreignKey: 'appel_id', as: 'dossiers' });
AppelProjet.belongsTo(AppelAProjet, { foreignKey: 'appel_id', as: 'appel' });

// ActivityLog → User (admin qui a effectué l'action)
ActivityLog.belongsTo(User, { as: 'admin', foreignKey: 'admin_id' });
User.hasMany(ActivityLog, { foreignKey: 'admin_id' });

// TypeProjet → DocumentTemplate (1 à N) (Ancien système, conservé pour historique)
TypeProjet.hasMany(DocumentTemplate, { foreignKey: 'type_projet_code', sourceKey: 'code', as: 'document_templates' });
DocumentTemplate.belongsTo(TypeProjet, { foreignKey: 'type_projet_code', targetKey: 'code', as: 'type_projet' });

// TypeProjet → DocumentModele (1 à N) (Nouveau système de fichiers)
TypeProjet.hasMany(DocumentModele, { foreignKey: 'type_projet_id', as: 'documents_modeles' });
DocumentModele.belongsTo(TypeProjet, { foreignKey: 'type_projet_id', as: 'type_projet' });


module.exports = {
  sequelize,
  User,
  AppelAProjet,
  Projet,
  Evaluation,
  Subvention,
  Notification,
  ProjetMobilite,
  AppelProjet,
  SecteurActivite,
  TypeProjet,
  ChampFormulaire,
  ActivityLog,
  FAQ,
  PageLegale,
  DocumentTemplate,
  DocumentModele,
};

