import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkAdmin() {
  console.log('Checking for admin user...');
  try {
    const snapshot = await db.collection('users').where('email', '==', 'admin@freshcount.com').get();
    
    if (snapshot.empty) {
      console.log('No user found with email: admin@freshcount.com');
      // List all users to see what's there
      const allUsers = await db.collection('users').get();
      console.log(`Total users found: ${allUsers.size}`);
      allUsers.forEach(doc => {
        console.log(`- ${doc.data().email} (${doc.data().role})`);
      });
    } else {
      snapshot.forEach(doc => {
        console.log('Admin user found:');
        console.log(`ID: ${doc.id}`);
        console.log(`Email: ${doc.data().email}`);
        console.log(`Role: ${doc.data().role}`);
        console.log(`Password Hash: ${doc.data().password ? 'Present' : 'Missing'}`);
      });
    }
  } catch (error) {
    console.error('Error checking admin:', error);
  }
}

checkAdmin();
