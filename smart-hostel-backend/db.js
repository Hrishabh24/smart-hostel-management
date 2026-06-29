const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
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
  }
}

const db = getFirestore();

module.exports = db;