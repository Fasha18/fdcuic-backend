require('dotenv').config();
const User = require('./src/models/User');

async function deleteUser(email) {
  try {
    const deletedCount = await User.destroy({ where: { email } });
    
    if (deletedCount > 0) {
      console.log(`✅ L'utilisateur avec l'email "${email}" a été supprimé avec succès.`);
    } else {
      console.log(`⚠️ Aucun utilisateur trouvé avec l'email "${email}".`);
    }
  } catch (err) {
    console.error('❌ Erreur lors de la suppression :', err);
  } finally {
    process.exit(0);
  }
}

const emailArg = process.argv[2];

if (!emailArg) {
  console.log('Veuillez fournir un email à supprimer.');
  console.log("Exemple d'utilisation : node deleteUser.js email@exemple.com");
  process.exit(1);
}

deleteUser(emailArg);
