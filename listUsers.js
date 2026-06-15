require('dotenv').config();
const { User } = require('./src/models/index');

async function listUsers() {
  const users = await User.findAll();
  console.log('Liste des utilisateurs:');
  users.forEach(u => {
    console.log(`- ID: ${u.id}, Email: '${u.email}', Role: ${u.role}`);
  });
  process.exit(0);
}
listUsers();
