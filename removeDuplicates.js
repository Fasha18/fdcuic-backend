require('dotenv').config();
const { AppelProjet, User } = require('./src/models/index');

async function removeDuplicates() {
  const dossiers = await AppelProjet.findAll({
    where: { user_id: 12 },
    order: [['createdAt', 'DESC']]
  });

  for (const d of dossiers) {
    console.log(`ID: ${d.id} | Appel_ID: ${d.appel_id} | Statut: ${d.statut} | Type: ${d.type_projet}`);
  }
}

removeDuplicates().catch(console.error).finally(() => process.exit(0));
