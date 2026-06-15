require('dotenv').config();
const { sequelize } = require('../models/index');
const SecteurActivite = require('../models/SecteurActivite');
const TypeProjet = require('../models/TypeProjet');
const ChampFormulaire = require('../models/ChampFormulaire');
const PageLegale = require('../models/PageLegale');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie.');
    await sequelize.sync();

    // ── SECTEURS D'ACTIVITÉ ──────────────────────────────
    await SecteurActivite.bulkCreate([
      { code: 'claque',        label: 'Claque',         ordre: 1 },
      { code: 'danse_urbaine', label: 'Danse urbaine',  ordre: 2 },
      { code: 'conception',    label: 'Conception',     ordre: 3 },
      { code: 'sport_de_rue',  label: 'Sport de rue',   ordre: 4 },
      { code: 'art_vivant',    label: 'Art vivant',     ordre: 5 },
      { code: 'mode',          label: 'Mode',           ordre: 6 },
      { code: 'hiphop',        label: 'Hip-hop',        ordre: 7 },
      { code: 'graffiti',      label: 'Graffiti',       ordre: 8 },
    ], { ignoreDuplicates: true });
    console.log('✅ Secteurs d\'activité créés.');

    // ── TYPES DE PROJET ──────────────────────────────────
    await TypeProjet.bulkCreate([
      { code: 'structuration', label: 'Structuration', nb_etapes: 4 },
      { code: 'formation',    label: 'Formation',     nb_etapes: 4 },
      { code: 'evenementiel', label: 'Événementiel',  nb_etapes: 4 },
    ], { ignoreDuplicates: true });
    console.log('✅ Types de projet créés.');

    // ── CHAMPS FORMULAIRE COMMUNS AUX 3 TYPES ────────────
    const typesCommuns = ['structuration', 'formation', 'evenementiel'];
    const champsCommuns = [
      { nom_champ: 'doc_ninea_recepisse', label: 'NINEA ou Récépissé',  obligatoire: true,  ordre: 1 },
      { nom_champ: 'doc_cni_passeport',   label: 'CNI ou Passeport',   obligatoire: true,  ordre: 2 },
      { nom_champ: 'doc_plan_action',     label: 'Plan d\'action',     obligatoire: false, ordre: 3 },
      { nom_champ: 'doc_photo_prototype', label: 'Photo ou Prototype', obligatoire: false, ordre: 4 },
    ];

    const champsACreer = [];

    // Champs communs pour chaque type
    for (const type of typesCommuns) {
      for (const champ of champsCommuns) {
        champsACreer.push({ type_projet: type, type_champ: 'fichier', ...champ });
      }
    }

    // Champs spécifiques structuration
    champsACreer.push(
      { type_projet: 'structuration', nom_champ: 'doc_analyse_financiere', label: 'Analyse financière',    type_champ: 'fichier', obligatoire: false, ordre: 5 },
      { type_projet: 'structuration', nom_champ: 'doc_business_model',     label: 'Business Model Canvas', type_champ: 'fichier', obligatoire: false, ordre: 6 },
    );

    // Champs spécifiques formation ET événementiel
    champsACreer.push(
      { type_projet: 'formation',    nom_champ: 'doc_budget', label: 'Budget prévisionnel', type_champ: 'fichier', obligatoire: false, ordre: 5 },
      { type_projet: 'evenementiel', nom_champ: 'doc_budget', label: 'Budget prévisionnel', type_champ: 'fichier', obligatoire: false, ordre: 5 },
    );

    await ChampFormulaire.bulkCreate(champsACreer, { ignoreDuplicates: true });
    console.log('✅ Champs formulaire créés.');

    // ── PAGES LÉGALES ────────────────────────────────────
    await PageLegale.bulkCreate([
      { type: 'mentions_legales',  contenu: '' },
      { type: 'cgu',              contenu: '' },
      { type: 'confidentialite',  contenu: '' },
    ], { ignoreDuplicates: true });
    console.log('✅ Pages légales créées.');

    console.log('\n🎉 Toutes les données initiales ont été insérées avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

seed();
