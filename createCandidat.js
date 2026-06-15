require('dotenv').config();
const { sequelize, User } = require('./src/models');
const bcrypt = require('bcrypt');

async function seedCandidat() {
  try {
    await sequelize.authenticate();
    
    const email = 'candidat@test.com';
    const mot_de_passe = await bcrypt.hash('candidat123', 10);
    
    const [candidat, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        nom: 'Candidat',
        prenom: 'Test',
        email: email,
        mot_de_passe_hash: mot_de_passe,
        role: 'candidat',
        est_active: true
      }
    });

    if (created) {
      console.log('Compte candidat créé avec succès:');
    } else {
      console.log('Le compte candidat existait déjà:');
    }
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: candidat123`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

seedCandidat();
