require('dotenv').config();
const { sequelize, ChampFormulaire } = require('./src/models');
const { QueryTypes } = require('sequelize');

async function removeDuplicates() {
  try {
    await sequelize.authenticate();
    console.log('Connexion réussie.');

    const sql = `
      DELETE FROM champs_formulaire
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY type_projet, nom_champ ORDER BY id) AS rnum
          FROM champs_formulaire
        ) t
        WHERE t.rnum > 1
      );
    `;

    const result = await sequelize.query(sql, { type: QueryTypes.DELETE });
    console.log('Doublons supprimés :', result);

  } catch (err) {
    console.error('Erreur :', err);
  } finally {
    await sequelize.close();
  }
}

removeDuplicates();
