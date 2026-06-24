/**
 * Script de génération et upload des fichiers templates Excel sur Cloudinary
 * Usage : node src/scripts/generateTemplates.js
 */
require('dotenv').config();
const ExcelJS = require('exceljs');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const DocumentTemplate = require('../models/DocumentTemplate');
const { sequelize } = require('../models/index');

// Styles communs
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4F8A' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const SECTION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF7' } };
const SECTION_FONT = { bold: true, color: { argb: 'FF1B4F8A' }, size: 10 };
const BORDER = {
  top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
};

function addHeaderRow(ws, title) {
  ws.getCell('A1').value = 'FDCUIC — FONDS DE DÉVELOPPEMENT DES CULTURES URBAINES ET INDUSTRIES CRÉATIVES';
  ws.getCell('A1').font = { bold: true, size: 10, color: { argb: 'FF666666' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.getCell('A2').value = title;
  ws.getCell('A2').font = { bold: true, size: 14, color: { argb: 'FF1B4F8A' } };
  ws.getCell('A2').alignment = { horizontal: 'center' };
  ws.addRow([]);
}

function styleCell(cell, options = {}) {
  if (options.fill) cell.fill = options.fill;
  if (options.font) cell.font = options.font;
  if (options.border !== false) cell.border = BORDER;
  if (options.align) cell.alignment = options.align;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BUSINESS MODEL CANVAS
// ─────────────────────────────────────────────────────────────────────────────
async function generateBMC() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FDCUIC';
  wb.created = new Date();
  const ws = wb.addWorksheet('Business Model Canvas', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  ws.mergeCells('A1:I1'); addHeaderRow(ws, 'Business Model Canvas');
  ws.mergeCells('A2:I2');

  // En-tête candidat
  ws.getCell('A4').value = 'Conçu pour :';
  ws.getCell('B4').value = '[Nom du candidat]';
  ws.getCell('D4').value = 'Conçu par :';
  ws.getCell('E4').value = '[Votre nom]';
  ws.getCell('G4').value = 'Date :';
  ws.getCell('H4').value = '[JJ/MM/AAAA]';
  ws.getCell('I4').value = 'Version :';
  ['A4','D4','G4','I4'].forEach(c => { ws.getCell(c).font = { bold: true, size: 10 }; });

  ws.addRow([]);

  const blocs = [
    { cell: 'A6', label: 'PARTENAIRES CLÉS', desc: 'Qui sont vos partenaires clés ?\nQui sont vos principaux fournisseurs ?\nQuelles ressources et activités vos partenaires réalisent-ils ?' },
    { cell: 'C6', label: 'ACTIVITÉS CLÉS', desc: 'Quelles activités clés sont requises par votre proposition de valeur ?\nVos canaux de distribution ?\nRelations clients ? Flux de revenus ?' },
    { cell: 'E6', label: 'PROPOSITIONS DE VALEUR', desc: 'Quelle valeur offrez-vous ?\nQuels problèmes résolvez-vous ?\nCaractéristiques : Nouveauté, Performance, Design, Prix, Accessibilité…' },
    { cell: 'G6', label: 'RELATIONS CLIENTS', desc: 'Quel type de relation vos segments attendent-ils ?\nComment sont-ils intégrés dans votre modèle ?\nCombien coûtent-ils ?' },
    { cell: 'I6', label: 'SEGMENTS CLIENTS', desc: 'Pour qui créez-vous de la valeur ?\nQui sont vos clients les plus importants ?\nNiche, Masse, Diversifiée ?' },
    { cell: 'C10', label: 'RESSOURCES CLÉS', desc: 'Types : Physiques (brevets, données), Humaines, Financières.\nQuelles ressources sont nécessaires ?' },
    { cell: 'G10', label: 'CANAUX', desc: 'Quels canaux vos clients préfèrent-ils ?\nComment les atteignez-vous ?\nQuels sont les plus rentables ?' },
    { cell: 'A14', label: 'STRUCTURE DE COÛTS', desc: 'Coûts fixes (salaires, loyers)\nCoûts variables\nÉconomies d\'échelle\nQuelles activités/ressources sont les plus chères ?' },
    { cell: 'F14', label: 'FLUX DE REVENUS', desc: 'Types : Vente d\'actifs, Abonnement, Location, Courtage, Publicité\nPrix Fixe ou Dynamique (négociation, marché temps réel)\nPour quelle valeur vos clients paient-ils ?' },
  ];

  blocs.forEach(({ cell, label, desc }) => {
    const c = ws.getCell(cell);
    c.value = `${label}\n\n${desc}\n\n\n[Remplissez ici]`;
    c.font = { size: 9 };
    c.alignment = { wrapText: true, vertical: 'top' };
    c.fill = SECTION_FILL;
    c.border = { top: { style: 'medium', color: { argb: 'FF1B4F8A' } }, left: { style: 'medium', color: { argb: 'FF1B4F8A' } }, bottom: { style: 'medium', color: { argb: 'FF1B4F8A' } }, right: { style: 'medium', color: { argb: 'FF1B4F8A' } } };
    ws.getCell(cell).font = { size: 9, bold: false };
    // Label en gras
    const firstLine = ws.getCell(cell);
    firstLine.value = { richText: [{ text: label + '\n\n', font: { bold: true, color: { argb: 'FF1B4F8A' }, size: 9 } }, { text: desc + '\n\n\n[Remplissez ici]', font: { size: 9, color: { argb: 'FF333333' } } }] };
  });

  // Dimensions colonnes
  ws.columns = [
    { width: 22 }, { width: 2 }, { width: 22 }, { width: 2 },
    { width: 25 }, { width: 2 }, { width: 22 }, { width: 2 }, { width: 22 }
  ];
  ws.getRow(6).height = 120;
  ws.getRow(10).height = 100;
  ws.getRow(14).height = 100;

  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PLAN D'ACTION
// ─────────────────────────────────────────────────────────────────────────────
async function generatePlanAction() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Plan d'action");

  ws.mergeCells('A1:P1');
  ws.getCell('A1').value = "FDCUIC — Plan d'action";
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1B4F8A' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  ws.addRow([]);
  ws.getCell('A3').value = 'Prénom et Nom du promoteur :';
  ws.getCell('A3').font = { bold: true, size: 10 };
  ws.getCell('C3').value = '[À remplir]';
  ws.getCell('H3').value = 'Titre du projet :';
  ws.getCell('H3').font = { bold: true, size: 10 };
  ws.getCell('J3').value = '[À remplir]';
  ws.addRow([]);

  // En-têtes colonnes
  const headers = [
    'Actions / Tâches à réaliser', 'QUI ?', 'OUI ?',
    'Date de début', 'Date de fin',
    'Juil. S1', 'Juil. S2', 'Juil. S3', 'Juil. S4',
    'Août S1', 'Août S2', 'Août S3', 'Août S4',
    'Septembre', 'Octobre', 'Novembre'
  ];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell, colNum) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  headerRow.height = 40;

  // 10 lignes vides
  for (let i = 0; i < 10; i++) {
    const row = ws.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    row.eachCell(cell => {
      cell.border = BORDER;
      if ([6,7,8,9,10,11,12,13,14,15,16].includes(cell.col)) {
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } };
      }
    });
    row.height = 25;
  }

  ws.columns = [
    { width: 40 }, { width: 18 }, { width: 8 }, { width: 14 }, { width: 14 },
    { width: 9 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 9 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 12 }, { width: 12 }, { width: 12 }
  ];

  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ANALYSE FINANCIÈRE
// ─────────────────────────────────────────────────────────────────────────────
async function generateAnalyseFinanciere() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Analyse financière');

  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = 'FDCUIC — Analyse financière';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1B4F8A' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow([]);

  const addSection = (title, rows) => {
    const titleRow = ws.addRow([title, '', '', '']);
    ws.mergeCells(`A${titleRow.number}:D${titleRow.number}`);
    titleRow.getCell(1).fill = HEADER_FILL;
    titleRow.getCell(1).font = HEADER_FONT;
    titleRow.getCell(1).border = BORDER;
    titleRow.height = 28;

    rows.forEach(([label, formula]) => {
      const r = ws.addRow([label, '', formula || '[À compléter]', '']);
      r.getCell(1).font = { bold: false, size: 10 };
      r.getCell(1).border = BORDER;
      r.getCell(2).border = BORDER;
      r.getCell(3).value = formula || 0;
      r.getCell(3).numFmt = '#,##0 "FCFA"';
      r.getCell(3).border = BORDER;
      r.getCell(4).border = BORDER;
      r.height = 22;
    });
    ws.addRow([]);
  };

  addSection('SECTION 1 — BILAN FINANCIER 2024', [
    ['Actif total (FCFA)'],
    ['Passif total (FCFA)'],
    ['Situation nette (= Actif - Passif)'],
  ]);

  addSection('SECTION 2 — PRÉVISIONS 2025-2026', [
    ["Chiffre d'affaires prévu (FCFA)"],
    ['Charges prévisionnelles (FCFA)'],
    ['Résultat prévisionnel (= CA - Charges)'],
  ]);

  addSection("SECTION 3 — ANALYSE FORCES / FAIBLESSES (SWOT)", []);

  const swotItems = [
    ['Forces (points forts — min 100 caractères)', ''],
    ['Faiblesses (points faibles — min 100 caractères)', ''],
    ['Opportunités (optionnel)', ''],
    ['Menaces (optionnel)', ''],
  ];
  swotItems.forEach(([label]) => {
    const r = ws.addRow([label, '[Décrivez ici...]', '', '']);
    ws.mergeCells(`B${r.number}:D${r.number}`);
    r.getCell(1).font = { bold: true, size: 10 };
    r.getCell(1).border = BORDER;
    r.getCell(2).border = BORDER;
    r.getCell(2).alignment = { wrapText: true };
    r.height = 60;
  });

  ws.columns = [{ width: 40 }, { width: 50 }, { width: 20 }, { width: 12 }];
  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BUDGET PRÉVISIONNEL (Formation)
// ─────────────────────────────────────────────────────────────────────────────
async function generateBudgetFormation() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Budget Formation');

  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'FDCUIC — Budget prévisionnel Formation 2026';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1B4F8A' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow(['Titre du projet :', '[À remplir]', '', 'Structure :', '[À remplir]', '']);
  ws.addRow([]);

  const colHeaders = ['Descriptions', 'Quantité', 'Nombre de jours', 'Unité en FCFA', 'Total (FCFA)', 'Partenaires'];
  const sections = [
    { title: 'SECTION 1 — Instructeurs / Animateurs', items: ['Instructeur principal', 'Animateur(s)', 'Formateur externe'] },
    { title: 'SECTION 2 — Matériel pédagogique', items: ['Supports de cours / manuels', 'Fournitures de bureau', 'Équipement informatique'] },
    { title: 'SECTION 3 — Locaux / Salle de formation', items: ['Location salle', 'Connexion internet', 'Climatisation / confort'] },
    { title: 'SECTION 4 — Participants', items: ['Logement (si applicable)', 'Repas / collation', 'Transport participants'] },
    { title: 'SECTION 5 — Équipements techniques', items: ['Vidéoprojecteur', 'Ordinateurs', 'Sonorisation'] },
    { title: 'SECTION 6 — Certification', items: ['Tests et évaluations', 'Diplômes / Attestations', 'Cérémonie de remise'] },
  ];

  let rowNum = 4;
  const subtotalRows = [];

  const hRow = ws.addRow(colHeaders);
  hRow.eachCell(cell => { cell.fill = HEADER_FILL; cell.font = HEADER_FONT; cell.border = BORDER; cell.alignment = { horizontal: 'center', wrapText: true }; });
  hRow.height = 35;
  rowNum++;

  sections.forEach(section => {
    const sRow = ws.addRow([section.title, '', '', '', '', '']);
    ws.mergeCells(`A${sRow.number}:F${sRow.number}`);
    sRow.getCell(1).fill = SECTION_FILL;
    sRow.getCell(1).font = SECTION_FONT;
    sRow.getCell(1).border = BORDER;
    sRow.height = 22;
    const firstItem = sRow.number + 1;

    section.items.forEach(item => {
      const r = ws.addRow([item, 0, 0, 0, { formula: `B${ws.rowCount + 1 - 1}*D${ws.rowCount + 1 - 1}` }, '']);
      r.eachCell(cell => { cell.border = BORDER; });
      r.getCell(4).numFmt = '#,##0';
      r.getCell(5).numFmt = '#,##0 "FCFA"';
      r.height = 22;
    });

    const stRow = ws.addRow(['', '', '', 'Sous-total', { formula: `SUM(E${firstItem}:E${ws.rowCount})` }, '']);
    stRow.getCell(4).font = { bold: true };
    stRow.getCell(5).font = { bold: true };
    stRow.getCell(5).numFmt = '#,##0 "FCFA"';
    stRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9E7' } };
    stRow.eachCell(cell => cell.border = BORDER);
    subtotalRows.push(`E${stRow.number}`);
    ws.addRow([]);
  });

  // Total général
  const totalRow = ws.addRow(['', '', '', 'TOTAL GÉNÉRAL', { formula: subtotalRows.join('+') }, '']);
  totalRow.getCell(4).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  totalRow.getCell(4).fill = HEADER_FILL;
  totalRow.getCell(5).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  totalRow.getCell(5).fill = HEADER_FILL;
  totalRow.getCell(5).numFmt = '#,##0 "FCFA"';
  totalRow.eachCell(cell => cell.border = BORDER);
  totalRow.height = 28;

  ws.columns = [{ width: 38 }, { width: 12 }, { width: 16 }, { width: 16 }, { width: 18 }, { width: 20 }];
  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BUDGET PRÉVISIONNEL (Événementiel)
// ─────────────────────────────────────────────────────────────────────────────
async function generateBudgetEvenementiel() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Budget Événementiel');

  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'FDCUIC — Budget prévisionnel Événementiel 2026';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1B4F8A' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow(['Titre événement :', '[À remplir]', '', 'Date événement :', '[JJ/MM/AAAA]', '']);
  ws.addRow([]);

  const colHeaders = ['Descriptions', 'Quantité', 'Nombre de jours', 'Unité en FCFA', 'Total (FCFA)', 'Partenaires'];
  const sections = [
    { title: 'SECTION 1 — Venue / Lieu', items: ['Location salle / terrain', 'Aménagement / décoration', 'Sécurité / gardiennage'] },
    { title: 'SECTION 2 — Artistes / Intervenants', items: ['Cachet artiste principal', 'Artistes support', "Per diem et transport artistes"] },
    { title: 'SECTION 3 — Production / Son / Lumière', items: ['Sonorisation (sound system)', 'Éclairage scénique', "Scène / podium / gradins"] },
    { title: 'SECTION 4 — Promotion / Marketing', items: ['Affiches / flyers', 'Réseaux sociaux / digital', 'Relations presse / médias'] },
    { title: 'SECTION 5 — Logistique', items: ['Transport équipe', 'Catering / restauration', "Hébergement équipe"] },
    { title: 'SECTION 6 — Assurance et licences', items: ["Assurance événementielle", "Droits d'auteur / licences", "Autorisation / permis"] },
  ];

  const hRow = ws.addRow(colHeaders);
  hRow.eachCell(cell => { cell.fill = HEADER_FILL; cell.font = HEADER_FONT; cell.border = BORDER; cell.alignment = { horizontal: 'center', wrapText: true }; });
  hRow.height = 35;
  const subtotalRows = [];

  sections.forEach(section => {
    const sRow = ws.addRow([section.title, '', '', '', '', '']);
    ws.mergeCells(`A${sRow.number}:F${sRow.number}`);
    sRow.getCell(1).fill = SECTION_FILL;
    sRow.getCell(1).font = SECTION_FONT;
    sRow.getCell(1).border = BORDER;
    sRow.height = 22;
    const firstItem = sRow.number + 1;

    section.items.forEach(item => {
      const r = ws.addRow([item, 0, 0, 0, 0, '']);
      r.eachCell(cell => cell.border = BORDER);
      r.getCell(4).numFmt = '#,##0';
      r.getCell(5).numFmt = '#,##0 "FCFA"';
      r.height = 22;
    });

    const stRow = ws.addRow(['', '', '', 'Sous-total', { formula: `SUM(E${firstItem}:E${ws.rowCount})` }, '']);
    stRow.getCell(4).font = { bold: true };
    stRow.getCell(5).font = { bold: true };
    stRow.getCell(5).numFmt = '#,##0 "FCFA"';
    stRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9E7' } };
    stRow.eachCell(cell => cell.border = BORDER);
    subtotalRows.push(`E${stRow.number}`);
    ws.addRow([]);
  });

  const totalRow = ws.addRow(['', '', '', 'TOTAL GÉNÉRAL', { formula: subtotalRows.join('+') }, '']);
  totalRow.getCell(4).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  totalRow.getCell(4).fill = HEADER_FILL;
  totalRow.getCell(5).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  totalRow.getCell(5).fill = HEADER_FILL;
  totalRow.getCell(5).numFmt = '#,##0 "FCFA"';
  totalRow.eachCell(cell => cell.border = BORDER);
  totalRow.height = 28;

  ws.columns = [{ width: 38 }, { width: 12 }, { width: 16 }, { width: 16 }, { width: 18 }, { width: 20 }];
  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PLAN DE FINANCEMENT (Structuration)
// ─────────────────────────────────────────────────────────────────────────────
async function generatePlanFinancement() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Plan de financement');

  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = 'FDCUIC — Plan de financement initial (H.T.)';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1B4F8A' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow([]);

  // BESOINS
  ws.addRow(['BESOINS', '', 'RESSOURCES', '']);
  ws.getCell(`A3`).fill = HEADER_FILL; ws.getCell(`A3`).font = HEADER_FONT;
  ws.getCell(`C3`).fill = HEADER_FILL; ws.getCell(`C3`).font = HEADER_FONT;

  const besoinsItems = ['Investissement', 'Fonds de roulement', 'Autres frais'];
  const ressourcesItems = ['Apport personnel', 'Apport en nature', 'Apport des partenaires', 'Emprunts et autres dettes', 'Microcrédit'];

  const maxLen = Math.max(besoinsItems.length, ressourcesItems.length);
  const besoinsStart = 4;

  for (let i = 0; i < maxLen; i++) {
    const bLabel = besoinsItems[i] || '';
    const rLabel = ressourcesItems[i] || '';
    const r = ws.addRow([bLabel, bLabel ? 0 : '', rLabel, rLabel ? 0 : '']);
    r.getCell(1).border = BORDER;
    r.getCell(2).border = BORDER;
    r.getCell(2).numFmt = '#,##0 "FCFA"';
    r.getCell(3).border = BORDER;
    r.getCell(4).border = BORDER;
    r.getCell(4).numFmt = '#,##0 "FCFA"';
    r.height = 24;
  }

  const besoinsEnd = besoinsStart + besoinsItems.length - 1;
  const ressourcesEnd = besoinsStart + ressourcesItems.length - 1;

  const totalRow = ws.addRow([
    'TOTAL BESOINS',
    { formula: `SUM(B${besoinsStart}:B${besoinsEnd})` },
    'TOTAL RESSOURCES',
    { formula: `SUM(D${besoinsStart}:D${ressourcesEnd})` }
  ]);
  totalRow.eachCell(cell => {
    cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER;
    cell.numFmt = '#,##0 "FCFA"';
  });
  totalRow.height = 26;

  ws.addRow([]);
  const tresoRow = ws.addRow(['TRÉSORERIE (Ressources − Besoins)', '', { formula: `D${totalRow.number}-B${totalRow.number}` }, '']);
  ws.mergeCells(`A${tresoRow.number}:B${tresoRow.number}`);
  tresoRow.getCell(1).font = { bold: true, size: 11 };
  tresoRow.getCell(3).numFmt = '#,##0 "FCFA"';
  tresoRow.getCell(3).font = { bold: true, size: 11, color: { argb: 'FF1B4F8A' } };
  tresoRow.eachCell(cell => cell.border = BORDER);
  tresoRow.height = 28;

  ws.addRow([]);
  const noteRow = ws.addRow(['⚠ La trésorerie doit être >= 0. Total BESOINS doit égaler Total RESSOURCES.', '', '', '']);
  ws.mergeCells(`A${noteRow.number}:D${noteRow.number}`);
  noteRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' }, size: 9 };

  ws.columns = [{ width: 35 }, { width: 20 }, { width: 30 }, { width: 20 }];
  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD SUR CLOUDINARY
// ─────────────────────────────────────────────────────────────────────────────
async function uploadWorkbookToCloudinary(wb, publicId) {
  const buffer = await wb.xlsx.writeBuffer();
  const stream = Readable.from(buffer);

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'fdcuic/templates',
        public_id: publicId,
        overwrite: true,
        format: 'xlsx',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.pipe(upload);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Génération et upload des templates Excel sur Cloudinary...\n');

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const tasks = [
      { generator: generateBMC, publicId: 'business_model_canvas_template', nom: 'business_model', label: 'Business Model Canvas' },
      { generator: generatePlanAction, publicId: 'plan_action_template', nom: 'plan_action_formation', label: "Plan d'action (Formation)" },
      { generator: generatePlanAction, publicId: 'plan_action_template_s', nom: 'plan_action_structuration', label: "Plan d'action (Structuration)" },
      { generator: generatePlanAction, publicId: 'plan_action_template_e', nom: 'plan_action_evenementiel', label: "Plan d'action (Événementiel)" },
      { generator: generateAnalyseFinanciere, publicId: 'analyse_financiere_template', nom: 'analyse_financiere', label: 'Analyse financière' },
      { generator: generateBudgetFormation, publicId: 'budget_formation_template', nom: 'budget_previsionnel', label: 'Budget prévisionnel (Formation)' },
      { generator: generateBudgetEvenementiel, publicId: 'budget_evenementiel_template', nom: 'budget_previsionnel_evenementiel', label: 'Budget prévisionnel (Événementiel)' },
      { generator: generatePlanFinancement, publicId: 'plan_financement_template', nom: 'plan_financement', label: 'Plan de financement' },
    ];

    for (const task of tasks) {
      process.stdout.write(`  📄 Génération : ${task.label} ... `);
      const wb = await task.generator();
      const result = await uploadWorkbookToCloudinary(wb, task.publicId);
      console.log(`✅ Uploadé → ${result.secure_url}`);

      // Mettre à jour le DocumentTemplate en base
      await DocumentTemplate.update(
        { fichier_template: result.secure_url, fichier_public_id: result.public_id },
        { where: { nom_document: task.nom } }
      );
      console.log(`     💾 Base mise à jour pour "${task.nom}"`);
    }

    console.log('\n🎉 Tous les templates ont été générés et uploadés sur Cloudinary !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
