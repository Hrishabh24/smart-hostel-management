const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (getApps().length === 0) {
  try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('🔥 Firebase initialized successfully with serviceAccountKey.json!');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) {
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
          privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
      console.log('🔥 Firebase initialized successfully with environment variables!');
    } else {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'smart-hostel-demo'
      });
      console.log('🔥 Firebase initialized with fallback configuration.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    if (getApps().length === 0) {
      try {
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'smart-hostel-demo'
        });
        console.log('🔥 Initialized fallback Firebase app after error.');
      } catch (fallbackErr) {
        console.error('Fallback initialization failed:', fallbackErr.message);
      }
    }
  }
}

const db = getFirestore();

module.exports = db;