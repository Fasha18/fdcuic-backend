require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('./src/models/index');
const { User } = require('./src/models/index');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la BD réussie.');

    const adminEmail = process.env.ADMIN_MAIL || 'admin@fdcuic.sn';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Vérifier si l'admin existe déjà
    const adminExist = await User.findOne({ where: { email: adminEmail } });
    if (adminExist) {
      console.log('Le compte Administrateur existe déjà dans la base de données.');
    } else {
      const mot_de_passe_hash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        nom: process.env.ADMIN_NAME || 'Admin',
        prenom: process.env.ADMIN_FIRST_NAME || 'FDCUIC',
        telephone: '000000000',
        email: adminEmail,
        mot_de_passe_hash: mot_de_passe_hash,
        role: 'admin',
        est_active: true,
      });
      console.log('✅ Compte Administrateur créé avec succès !');
      console.log(`Email : ${adminEmail}`);
      console.log(`Mot de passe : ${adminPassword}`);
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
