import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import bcrypt from 'bcryptjs';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function createAdmin() {
  console.log('Creating admin user...');
  try {
    const email = 'admin@freshcount.com';
    const password = 'admin123';
    const name = 'Admin User';
    const role = 'admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userRef = db.collection('users').doc();
    await userRef.set({
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    console.log('Admin user created successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
