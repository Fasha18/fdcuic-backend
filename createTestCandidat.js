require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./src/models');

async function createTestCandidat() {
  try {
    const email = 'test@candidat.com';
    const password = 'passer123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ where: { email } });

    if (user) {
      await user.update({ mot_de_passe_hash: hashedPassword, role: 'candidat', est_active: true });
      console.log('Utilisateur de test mis à jour.');
    } else {
      user = await User.create({
        nom: 'Candidat',
        prenom: 'Test',
        email: email,
        mot_de_passe_hash: hashedPassword,
        role: 'candidat',
        est_active: true,
      });
      console.log('Utilisateur de test créé avec succès.');
    }

    console.log(`\nEmail: ${email}\nMot de passe: ${password}\n`);
    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
}

createTestCandidat();
