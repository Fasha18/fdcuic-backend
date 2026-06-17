require('dotenv').config();
const { envoyerEmailActivation } = require('./src/services/emailService');

async function test() {
  try {
    console.log('Test d\\'envoi d\\'email...');
    console.log('MAIL_PASS (longueur):', process.env.MAIL_PASS ? process.env.MAIL_PASS.length : 0);
    await envoyerEmailActivation('fbiaye18@gmail.com', 'Test', '12345');
    console.log('Email envoyé avec succès !');
  } catch (err) {
    console.error('Erreur lors de l\\'envoi:', err.message);
  }
}
test();
