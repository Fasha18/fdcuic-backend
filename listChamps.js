require('dotenv').config();
const { sequelize, ChampFormulaire } = require('./src/models');

async function listChamps() {
  try {
    await sequelize.authenticate();
    const champs = await ChampFormulaire.findAll({
      attributes: ['id', 'type_projet', 'nom_champ', 'label'],
      order: [['type_projet', 'ASC'], ['id', 'ASC']]
    });
    console.log(`Total champs: ${champs.length}`);
    champs.forEach(c => console.log(`${c.id}: ${c.type_projet} - ${c.nom_champ}`));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

listChamps();
