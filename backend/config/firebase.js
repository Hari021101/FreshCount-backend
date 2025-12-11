import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let db;
let auth;

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  }
} catch (error) {
  console.warn('Warning: Firebase configuration not found. Set FIREBASE_SERVICE_ACCOUNT env var or add serviceAccountKey.json');
  serviceAccount = null;
}


if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  auth = admin.auth();
} else {
  // Fallback for development - you can also use environment variables
  console.log('Running without Firebase Admin - some features may not work');
  db = null;
  auth = null;
}

export { admin, db, auth };
