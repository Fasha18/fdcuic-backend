require('dotenv').config();
const sequelize = require('./src/config/database');
const SecteurActivite = require('./src/models/SecteurActivite');

const ICONS = [
  'music_note', 'theater_comedy', 'directions_run', 'palette', 
  'book', 'movie', 'landscape', 'celebration', 
  'camera_alt', 'mic', 'computer', 'public'
];

async function fixSchemaAndAssignIcons() {
  try {
    await sequelize.authenticate();
    console.log('Connecté à la base de données.');
    
    // 1. Rename column 'label' to 'nom' if it exists
    try {
      await sequelize.query('ALTER TABLE "secteurs_activite" RENAME COLUMN "label" TO "nom";');
      console.log('Colonne label renommée en nom.');
    } catch (e) {
      console.log('La colonne label a peut-être déjà été renommée ou n\'existe pas.');
    }

    // 2. Add column 'icone' if it doesn't exist
    try {
      await sequelize.query('ALTER TABLE "secteurs_activite" ADD COLUMN "icone" VARCHAR(50);');
      console.log('Colonne icone ajoutée.');
    } catch (e) {
      console.log('La colonne icone existe probablement déjà.');
    }

    // 3. Drop column 'ordre' if it exists
    try {
      await sequelize.query('ALTER TABLE "secteurs_activite" DROP COLUMN "ordre";');
      console.log('Colonne ordre supprimée.');
    } catch (e) {
      console.log('La colonne ordre est déjà supprimée.');
    }

    // Now safe to query
    const secteurs = await sequelize.query('SELECT * FROM "secteurs_activite"', { type: sequelize.QueryTypes.SELECT });
    
    for (let i = 0; i < secteurs.length; i++) {
      const secteur = secteurs[i];
      if (!secteur.icone || secteur.icone === 'category') {
        const randomIcon = ICONS[i % ICONS.length];
        await sequelize.query(`UPDATE "secteurs_activite" SET "icone" = '${randomIcon}' WHERE "id" = ${secteur.id};`);
        console.log(`Mis à jour: ${secteur.code} -> ${randomIcon}`);
      }
    }
    
    console.log('Mise à jour terminée avec succès.');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

fixSchemaAndAssignIcons();
