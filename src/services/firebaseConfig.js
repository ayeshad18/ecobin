// Firebase Configuration and Integration Adapter
// Designed to connect directly to Firebase Authentication & Cloud Firestore

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyD-YOUR-FIREBASE-API-KEY",
  authDomain: "ecobin-smart-campus.firebaseapp.com",
  projectId: "ecobin-smart-campus",
  storageBucket: "ecobin-smart-campus.appspot.com",
  messagingSenderId: "109823490182",
  appId: "1:109823490182:web:7823ab90e11892",
};

/**
 * When deploying with active Firebase:
 * 1. Install firebase: `npm install firebase`
 * 2. Fill in your project config values above
 * 3. Uncomment the initialization block below:
 *
 * import { initializeApp } from 'firebase/app';
 * import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
 * import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
 *
 * export const app = initializeApp(firebaseConfig);
 * export const auth = getAuth(app);
 * export const db = getFirestore(app);
 *
 * export const COLLECTIONS = {
 *   BINS: 'dustbins',
 *   STAFF: 'cleaning_staff',
 *   CLEANINGS: 'cleaning_records',
 *   REPORTS: 'problem_reports',
 *   SUGGESTIONS: 'location_suggestions'
 * };
 */

export const FIREBASE_SETUP_GUIDE = `
# Firebase Connection Setup Guide for EcoBin

1. Go to https://console.firebase.google.com and create a project named 'ecobin-campus'.
2. Enable Authentication (Email/Password).
3. Create a Cloud Firestore database in production or test mode.
4. Add 5 collections:
   - 'dustbins' (ID, name, zone, location, fillLevel, distanceCm, tiltAngle, isOverturned, isOffline)
   - 'cleaning_staff' (ID, name, role, assignedZone, email, phone)
   - 'cleaning_records' (binId, staffId, staffName, cleanedAt, beforeFill, afterFill, notes)
   - 'problem_reports' (binId, reportedBy, issueType, priority, description, status)
   - 'location_suggestions' (suggestedBy, locationName, zone, reason, status)
5. Copy your Web App config object into 'src/services/firebaseConfig.js'.
`;
