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
    const username = 'admin'; // Using 'email' field for username storage to minimize refactor
    const password = 'admin123';
    const name = 'Admin User';
    const role = 'admin';

    // 1. Cleanup old admin users to prevent duplicates
    const usersRef = db.collection('users');
    const oldAdminQuery = await usersRef.where('role', '==', 'admin').get();
    
    if (!oldAdminQuery.empty) {
      console.log(`Found ${oldAdminQuery.size} existing admin(s). Removing them...`);
      const batch = db.batch();
      oldAdminQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Old admin accounts removed.');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create new user document
    const userRef = usersRef.doc();
    await userRef.set({
      email: username, // Storing 'admin' in the email field
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    console.log('Admin user created successfully.');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
