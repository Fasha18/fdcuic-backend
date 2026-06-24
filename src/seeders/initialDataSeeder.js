require('dotenv').config();
const { sequelize } = require('../models/index');
const SecteurActivite = require('../models/SecteurActivite');
const TypeProjet = require('../models/TypeProjet');
const ChampFormulaire = require('../models/ChampFormulaire');
const PageLegale = require('../models/PageLegale');
const DocumentTemplate = require('../models/DocumentTemplate');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion PostgreSQL réussie.');
    await sequelize.sync();

    // ── SECTEURS D'ACTIVITÉ ──────────────────────────────
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
    console.log("✅ Secteurs d'activité créés.");

    // ── TYPES DE PROJET ──────────────────────────────────
    await TypeProjet.bulkCreate([
      { code: 'structuration', label: 'Structuration', nb_etapes: 4 },
      { code: 'formation',    label: 'Formation',     nb_etapes: 4 },
      { code: 'evenementiel', label: 'Événementiel',  nb_etapes: 4 },
    ], { ignoreDuplicates: true });
    console.log('✅ Types de projet créés.');

    // ── CHAMPS FORMULAIRE ────────────────────────────────
    const typesCommuns = ['structuration', 'formation', 'evenementiel'];
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
    champsACreer.push(
      { type_projet: 'structuration', nom_champ: 'doc_analyse_financiere', label: 'Analyse financière',    type_champ: 'fichier', obligatoire: false, ordre: 5 },
      { type_projet: 'structuration', nom_champ: 'doc_business_model',     label: 'Business Model Canvas', type_champ: 'fichier', obligatoire: false, ordre: 6 },
      { type_projet: 'formation',     nom_champ: 'doc_budget',             label: 'Budget prévisionnel',   type_champ: 'fichier', obligatoire: false, ordre: 5 },
      { type_projet: 'evenementiel',  nom_champ: 'doc_budget',             label: 'Budget prévisionnel',   type_champ: 'fichier', obligatoire: false, ordre: 5 },
    );
    await ChampFormulaire.bulkCreate(champsACreer, { ignoreDuplicates: true });
    console.log('✅ Champs formulaire créés.');

    // ── TEMPLATES DE DOCUMENTS ────────────────────────────
    const templates = [
      {
        type_projet_code: 'structuration',
        nom_document: 'business_model',
        label: 'Business Model Canvas',
        description: 'Présentez votre modèle économique en 9 blocs : Partenaires, Activités, Ressources, Proposition de valeur, Relations clients, Canaux, Segments clients, Structure de coûts, Flux de revenus.',
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'entete', titre: 'En-tête', type: 'text', champs: ['Conçu pour (candidat)', 'Conçu par', 'Date', 'Version'] },
          { id: 'bloc_partenaires', titre: 'Partenaires clés', type: 'textarea', min_chars: 50, max_chars: 500, description: "Qui sont vos partenaires clés ? Qui sont vos principaux fournisseurs ? Quelles ressources et activités clés vos partenaires réalisent-ils ?" },
          { id: 'bloc_activites', titre: 'Activités clés', type: 'textarea', min_chars: 50, max_chars: 500, description: "Quelles sont les activités clés requises par vos propositions de valeur, canaux de distribution, relations clients et flux de revenus ?" },
          { id: 'bloc_ressources', titre: 'Ressources clés', type: 'textarea', min_chars: 50, max_chars: 500, description: "Quelles ressources clés (Physiques, Humaines, Financières) sont nécessaires à votre proposition de valeur ?" },
          { id: 'bloc_valeur', titre: 'Propositions de valeur', type: 'textarea', min_chars: 100, max_chars: 800, description: "Quelle valeur offrez-vous à vos clients ? Quels problèmes résolvez-vous ? (Nouveauté, Performance, Design, Prix, Accessibilité…)" },
          { id: 'bloc_relations', titre: 'Relations clients', type: 'textarea', min_chars: 50, max_chars: 500, description: "Quel type de relation chaque segment de clientèle attend-il ? Comment sont-ils intégrés à votre modèle ?" },
          { id: 'bloc_canaux', titre: 'Canaux', type: 'textarea', min_chars: 50, max_chars: 500, description: "Quels sont les canaux préférés par vos clients ? Comment les atteignez-vous ? Quels sont les plus rentables ?" },
          { id: 'bloc_segments', titre: 'Segments clients', type: 'textarea', min_chars: 50, max_chars: 500, description: "Pour qui créez-vous de la valeur ? Qui sont vos clients les plus importants ? (Niche, Masse, Diversifiée ?)" },
          { id: 'bloc_couts', titre: 'Structure de coûts', type: 'textarea', min_chars: 50, max_chars: 500, description: "Quels sont les coûts les plus importants ? (Coûts fixes: salaires, loyers / Coûts variables / Économies d'échelle)" },
          { id: 'bloc_revenus', titre: 'Flux de revenus', type: 'textarea', min_chars: 50, max_chars: 500, description: "Pour quelle valeur vos clients sont-ils disposés à payer ? Types: Vente d'actifs, Abonnement, Location, Courtage, Publicité. Prix: Fixe ou Dynamique." },
        ],
      },
      {
        type_projet_code: 'formation',
        nom_document: 'plan_action_formation',
        label: "Plan d'action",
        description: "Détaillez vos actions, les responsables, les dates et la timeline sur plusieurs semaines/mois.",
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'info_promoteur', titre: 'Prénom et Nom du promoteur', type: 'text', obligatoire: true },
          { id: 'titre_projet', titre: 'Titre du projet', type: 'text', obligatoire: true },
          { id: 'actions_tableau', titre: "Tableau d'actions", type: 'table', colonnes: ['Action/Tâche à réaliser', 'QUI ?', 'OUI ?', 'Date de début', 'Date de fin', 'Juil S1', 'Juil S2', 'Juil S3', 'Juil S4', 'Août S1', 'Août S2', 'Août S3', 'Août S4', 'Septembre', 'Octobre'], min_lignes: 5 },
        ],
      },
      {
        type_projet_code: 'structuration',
        nom_document: 'plan_action_structuration',
        label: "Plan d'action",
        description: "Détaillez vos actions, les responsables, les dates et la timeline sur plusieurs semaines/mois.",
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'info_promoteur', titre: 'Prénom et Nom du promoteur', type: 'text', obligatoire: true },
          { id: 'titre_projet', titre: 'Titre du projet', type: 'text', obligatoire: true },
          { id: 'actions_tableau', titre: "Tableau d'actions", type: 'table', colonnes: ['Action/Tâche à réaliser', 'QUI ?', 'OUI ?', 'Date de début', 'Date de fin', 'Juil S1', 'Juil S2', 'Juil S3', 'Juil S4', 'Août S1', 'Août S2', 'Août S3', 'Août S4', 'Septembre', 'Octobre'], min_lignes: 5 },
        ],
      },
      {
        type_projet_code: 'evenementiel',
        nom_document: 'plan_action_evenementiel',
        label: "Plan d'action",
        description: "Détaillez vos actions, les responsables, les dates et la timeline sur plusieurs semaines/mois.",
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'info_promoteur', titre: 'Prénom et Nom du promoteur', type: 'text', obligatoire: true },
          { id: 'titre_projet', titre: 'Titre du projet', type: 'text', obligatoire: true },
          { id: 'actions_tableau', titre: "Tableau d'actions", type: 'table', colonnes: ['Action/Tâche à réaliser', 'QUI ?', 'OUI ?', 'Date de début', 'Date de fin', 'Juil S1', 'Juil S2', 'Juil S3', 'Juil S4', 'Août S1', 'Août S2', 'Août S3', 'Août S4', 'Septembre', 'Octobre'], min_lignes: 5 },
        ],
      },
      {
        type_projet_code: 'structuration',
        nom_document: 'analyse_financiere',
        label: 'Analyse financière',
        description: 'Analysez votre situation financière : bilan 2024, prévisions 2025-2026 et analyse forces/faiblesses (SWOT).',
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'bilan_2024', titre: 'Bilan financier 2024', type: 'section', champs: [{ label: 'Actif total (FCFA)', type: 'number' }, { label: 'Passif total (FCFA)', type: 'number' }, { label: 'Situation nette', type: 'calcul_auto', formule: 'Actif - Passif' }] },
          { id: 'previsions', titre: 'Prévisions 2025-2026', type: 'section', champs: [{ label: "Chiffre d'affaires prévu (FCFA)", type: 'number' }, { label: 'Charges prévisionnelles (FCFA)', type: 'number' }, { label: 'Résultat prévisionnel', type: 'calcul_auto', formule: 'CA - Charges' }] },
          { id: 'swot', titre: 'Analyse Forces / Faiblesses / Opportunités / Menaces', type: 'section', champs: [{ label: 'Forces (min 100 caract.)', type: 'textarea', obligatoire: true }, { label: 'Faiblesses (min 100 caract.)', type: 'textarea', obligatoire: true }, { label: 'Opportunités', type: 'textarea', obligatoire: false }, { label: 'Menaces', type: 'textarea', obligatoire: false }] },
        ],
      },
      {
        type_projet_code: 'formation',
        nom_document: 'budget_previsionnel',
        label: 'Budget prévisionnel',
        description: 'Détaillez votre budget par sections en FCFA : Instructeurs, Matériel pédagogique, Locaux, Participants, Équipements, Certification.',
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'tableau', titre: 'Tableau budgétaire', type: 'table', colonnes: ['Descriptions', 'Quantité', 'Nombre de jours', 'Unité en FCFA', 'Total (FCFA)', 'Partenaires'] },
          { id: 'section_1', titre: 'Section 1 : Instructeurs / Animateurs', type: 'section', min_lignes: 3 },
          { id: 'section_2', titre: 'Section 2 : Matériel pédagogique', type: 'section', min_lignes: 3 },
          { id: 'section_3', titre: 'Section 3 : Locaux / Salle de formation', type: 'section', min_lignes: 3 },
          { id: 'section_4', titre: 'Section 4 : Participants (logement, repas)', type: 'section', min_lignes: 3 },
          { id: 'section_5', titre: 'Section 5 : Équipements / Matériel technique', type: 'section', min_lignes: 3 },
          { id: 'section_6', titre: 'Section 6 : Certification (tests, diplômes)', type: 'section', min_lignes: 2 },
          { id: 'total', titre: 'Total général (FCFA)', type: 'calcul_auto' },
        ],
      },
      {
        type_projet_code: 'evenementiel',
        nom_document: 'budget_previsionnel_evenementiel',
        label: 'Budget prévisionnel',
        description: 'Détaillez votre budget événementiel par sections en FCFA : Venue, Artistes, Production, Promotion, Logistique, Assurances.',
        fichier_template: null,
        obligatoire: true,
        sections: [
          { id: 'tableau', titre: 'Tableau budgétaire', type: 'table', colonnes: ['Descriptions', 'Quantité', 'Nombre de jours', 'Unité en FCFA', 'Total (FCFA)', 'Partenaires'] },
          { id: 'section_1', titre: 'Section 1 : Venue / Lieu', type: 'section', min_lignes: 3 },
          { id: 'section_2', titre: 'Section 2 : Artistes / Intervenants', type: 'section', min_lignes: 3 },
          { id: 'section_3', titre: 'Section 3 : Production / Son / Lumière', type: 'section', min_lignes: 3 },
          { id: 'section_4', titre: 'Section 4 : Promotion / Marketing', type: 'section', min_lignes: 3 },
          { id: 'section_5', titre: 'Section 5 : Logistique (transport, catering)', type: 'section', min_lignes: 3 },
          { id: 'section_6', titre: 'Section 6 : Assurance et licences', type: 'section', min_lignes: 2 },
          { id: 'total', titre: 'Total général (FCFA)', type: 'calcul_auto' },
        ],
      },
      {
        type_projet_code: 'structuration',
        nom_document: 'plan_financement',
        label: 'Plan de financement initial (H.T.)',
        description: "Équilibrez vos besoins (investissements, fonds de roulement) et vos ressources (apports, emprunts). L'équilibre doit être >= 0.",
        fichier_template: null,
        obligatoire: false,
        sections: [
          { id: 'besoins', titre: 'BESOINS', type: 'section', lignes: [{ label: 'Investissement (FCFA)', type: 'input_number' }, { label: 'Fonds de roulement (FCFA)', type: 'input_number' }, { label: 'Autres frais (FCFA)', type: 'input_number' }, { label: 'Total BESOINS', type: 'calcul_auto' }] },
          { id: 'ressources', titre: 'RESSOURCES', type: 'section', lignes: [{ label: 'Apport personnel (FCFA)', type: 'input_number' }, { label: 'Apport en nature (FCFA)', type: 'input_number' }, { label: 'Apport des partenaires (FCFA)', type: 'input_number' }, { label: 'Emprunts et autres dettes (FCFA)', type: 'input_number' }, { label: 'Microcrédit (FCFA)', type: 'input_number' }, { label: 'Total RESSOURCES', type: 'calcul_auto' }] },
          { id: 'tresorerie', titre: 'TRÉSORERIE', type: 'calcul_auto', formule: 'Total RESSOURCES - Total BESOINS', condition: '>= 0' },
        ],
      },
    ];

    await DocumentTemplate.bulkCreate(templates, { ignoreDuplicates: true });
    console.log('✅ 8 templates de documents créés.');

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
    console.log('Seeder error, but continuing...'); process.exit(0);
  }
};

seed();
