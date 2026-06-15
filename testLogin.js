require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./src/models/index');

async function testLogin() {
  const email = 'admin@fdcuic.sn';
  const pass = 'admin123';
  
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log('Utilisateur non trouvé dans la base de données');
    return;
  }
  
  console.log('Utilisateur trouvé:', user.email, 'Role:', user.role);
  
  const isValid = await bcrypt.compare(pass, user.mot_de_passe_hash);
  if (isValid) {
    console.log('✅ Mot de passe VALIDE');
  } else {
    console.log('❌ Mot de passe INVALIDE');
  }
  process.exit(0);
}
testLogin();
