require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models/index');

const creerAdmin = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const adminExiste = await User.findOne({ where: { email: process.env.ADMIN_MAIL } });
        if (adminExiste) {
            console.log('Admin existe deja ');
            process.exit(0);
        }
        const mot_de_passe_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

        await User.create({
            nom: process.env.ADMIN_NAME,
            prenom: process.env.ADMIN_FIRST_NAME,
            email: process.env.ADMIN_MAIL,
            mot_de_passe_hash,
            role: 'admin',
            est_active: true,        // ← ajouter cette ligne
            token_activation: null,  // ← ajouter cette ligne
        })
        console.log('Admin créé avec succès !');
        console.log('Email: [MAIL_ADDRESS]');
        console.log('Password : [ADMIN_PASSWORD]');
        process.exit(0);
    }
    catch (error) {
        console.error('Erreur :', error.message);
        process.exit(1);

    }
}
creerAdmin();