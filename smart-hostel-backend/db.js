const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (getApps().length === 0) {
  let loadedCredential = null;

  // 1. Search for serviceAccountKey.json across all common deployment locations
  const possiblePaths = [
    path.join(__dirname, 'serviceAccountKey.json'),
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), 'smart-hostel-backend', 'serviceAccountKey.json'),
    '/etc/secrets/serviceAccountKey.json' // Render secret file default location
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
        loadedCredential = cert(serviceAccount);
        console.log(`🔥 Firebase initialized with serviceAccountKey.json found at: ${p}`);
        break;
      } catch (e) {
        console.warn(`Could not load ${p}:`, e.message);
      }
    }
  }

  // 2. Try Base64-encoded service account from environment
  if (!loadedCredential && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const jsonStr = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(jsonStr);
      loadedCredential = cert(serviceAccount);
      console.log('🔥 Firebase initialized successfully with FIREBASE_SERVICE_ACCOUNT_BASE64!');
    } catch (e) {
      console.warn('Failed parsing FIREBASE_SERVICE_ACCOUNT_BASE64:', e.message);
    }
  }

  // 3. Try raw JSON string from environment
  if (!loadedCredential && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      loadedCredential = cert(serviceAccount);
      console.log('🔥 Firebase initialized successfully with FIREBASE_SERVICE_ACCOUNT_KEY!');
    } catch (e) {
      console.warn('Failed parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
    }
  }

  // 4. Try individual environment variables
  if (!loadedCredential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      loadedCredential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      });
      console.log('🔥 Firebase initialized successfully with individual environment variables!');
    } catch (e) {
      console.warn('Failed initializing with individual env vars:', e.message);
    }
  }

  if (loadedCredential) {
    try {
      initializeApp({ credential: loadedCredential });
    } catch (e) {
      console.error('Error applying Firebase credentials:', e.message);
    }
  } else {
    console.error('❌ WARNING: No Firebase Admin credentials found! Set FIREBASE_SERVICE_ACCOUNT_BASE64 or add /etc/secrets/serviceAccountKey.json on Render.');
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'smart-hostel-b9d88'
      });
    } catch (fallbackErr) {
      console.error('Fallback initialization failed:', fallbackErr.message);
    }
  }
}

const db = getFirestore();

module.exports = db;
