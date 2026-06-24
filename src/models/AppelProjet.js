const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppelProjet = sequelize.define('AppelProjet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // ── ÉTAPE 1 : Informations générales ──────────────────
  prenom_nom_porteur: {
  type: DataTypes.STRING(255),
  allowNull: true,
  comment: 'Prénom et nom du porteur de projet',
},
  nom_structure: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  type_projet: {
    type: DataTypes.ENUM('structuration', 'formation', 'evenementiel', 'mobilite'),
    allowNull: true,
  },
  secteur_activite: {
    type: DataTypes.ENUM(
      'claque', 'danse_urbaine', 'conception',
      'sport_de_rue', 'art_vivant', 'mode',
      'hiphop', 'graffiti'
    ),
    allowNull: true,
  },
  region: {
    type: DataTypes.ENUM(
      'Dakar', 'Thiès', 'Diourbel', 'Fatick',
      'Kaolack', 'Kaffrine', 'Saint-Louis', 'Louga',
      'Matam', 'Tambacounda', 'Kédougou', 'Kolda',
      'Ziguinchor', 'Sédhiou'
    ),
    allowNull: true,
  },
  activite_entreprise: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nature_projet: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // ── ÉTAPE 2 : Détails et impacts ──────────────────────
  phase_ideation: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'Oui = true, Non = false',
  },
  phase_execution: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'Oui = true, Non = false',
  },
  objectifs_globaux: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  importance_territoire: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Offre nouvelle, innovante, marché émergent',
  },
  impacts_economiques: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Création, renforcement d\'emplois',
  },
  potentiel_reussite: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  localisation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  beneficiaires: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  plan_perennisation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description_produit: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description détaillée du produit ou service',
  },
  equipe: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tableau max 3 personnes : [{poste, prenom, nom, telephone}]',
  },

  // ── ÉTAPE 3 : Documents (communs aux 3 types) ─────────
doc_ninea_recepisse: {
  type: DataTypes.STRING(500),
  allowNull: true,
  comment: 'NINEA ou Récépissé',
},
doc_cni_passeport: {
  type: DataTypes.STRING(500),
  allowNull: true,
  comment: 'CNI ou Passeport',
},
doc_budget: {
  type: DataTypes.STRING(500),
  allowNull: true,
  comment: 'Formation et Événementiel uniquement',
},
doc_plan_action: {
  type: DataTypes.STRING(500),
  allowNull: true,
},
doc_photo_prototype: {
  type: DataTypes.STRING(500),
  allowNull: true,
},

// ── ÉTAPE 3 : Documents Structuration uniquement ──────
doc_analyse_financiere: {
  type: DataTypes.STRING(500),
  allowNull: true,
  comment: 'Structuration uniquement',
},
doc_business_model: {
  type: DataTypes.STRING(500),
  allowNull: true,
  comment: 'Structuration uniquement — Business Model Canvas',
},

  // ── STATUT GÉNÉRAL ────────────────────────────────────
  etape_courante: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  statut: {
    type: DataTypes.ENUM(
      'brouillon',
      'soumis',
      'en_examen',
      'accepte',
      'rejete'
    ),
    defaultValue: 'brouillon',
  },

  // ── CLÉS ÉTRANGÈRES ───────────────────────────────────
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  appel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'appels_projets',
  timestamps: true,
});

module.exports = AppelProjet;