const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjetMobilite = sequelize.define('ProjetMobilite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // ── ÉTAPE 1 : Informations générales ──────────────────
  nom_structure: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom de la structure ou de l artiste',
  },
  discipline: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Discipline artistique ou culturelle',
  },
  date_depart: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date de départ prévue',
  },
  date_arrivee: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date d arrivée prévue',
  },
  pays_destination: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Pays de destination',
  },
  region_destination: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Région du pays de destination',
  },

  // ── ÉTAPE 2 : Contexte et objectifs ───────────────────
  Presentation_succincte: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Qui êtes-vous ?',
  },
  opportunite: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Événement, invitation, partenariat...',
  },
  pertinence: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Pourquoi maintenant ?',
  },
  objectifs_generaux: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  objectifs_specifiques: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Liste des objectifs spécifiques que vous souhaitez atteindre à travers cette mobilité ?',
  },

  // ── ÉTAPE 3 : Programme et impact ─────────────────────
  programme_sejour_detaille_du_sejour: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Décrivez le déroulement du séjour jour par jour ou par grande phase de votre séjour.',
  },
  activites_prevues: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Listez les activités que vous allez mener (ateliers, conférences, rencontres, etc)',
  },
  resultats_attendus: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Quels sont les resultats concrets attendus à l\'issue de cette mobilité ? (livrables, expositions, rencontres, etc.)',
  },
  impacts: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Expliquez l\'impact attendu de ce projet sur votre pratique votre public, votre carrière ou votre structure.',
  },

  // ── ÉTAPE 4 : Documents et annexes ────────────────────
  doc_ninea: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Fichier NINEA',
  },
  doc_recepisse: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Récépissé',
  },
  doc_invitation: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Lettre d\'invitation officielle',
  },
  doc_note_structure: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Note de présentation de la structure d accueil',
  },
  doc_cv_portfolio: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'CV ou Portfolio',
  },
  image_couverture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Chemin vers l image de couverture de la mobilité',
  },

 // ── STATUT GÉNÉRAL ────────────────────────────────────
  etape_courante: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Étape en cours : 1 à 5',
  },
  statut: {
    type: DataTypes.ENUM(
      'brouillon',  // En cours de remplissage
      'soumis',     // Soumis — en attente d examen
      'en_examen',  // En cours d évaluation
      'accepte',    // Accepté
      'rejete'      // Rejeté
    ),
    defaultValue: 'brouillon',
  },

  // ── CLÉ ÉTRANGÈRE ─────────────────────────────────────
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'projets_mobilite',
  timestamps: true,
});

module.exports = ProjetMobilite;

