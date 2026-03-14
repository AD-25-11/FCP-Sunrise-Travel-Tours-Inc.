require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Admin } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fcp-sunrise-admin';

async function seed() {
  const email = (process.env.ADMIN_EMAIL || 'admin@sunrisetravel.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'FCP Admin';

  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate(
    { email },
    { name, email, passwordHash, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin user seeded for ${email}`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
