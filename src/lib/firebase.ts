import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const env = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : ({} as any);

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyD02aD4-o-ZKKWPg_IKLGFFxmDOMg20y2g",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "portfoliohubs-update.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "portfoliohubs-update",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "portfoliohubs-update.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "830737909476",
  appId: env.VITE_FIREBASE_APP_ID || "1:830737909476:web:7bd5e6fc91aaa303b24ef1",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-EYE00L54C5"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Firebase Analytics safely (supported only in client browser environments)
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics initialization failed or unsupported in this environment
  });
}

// Prevent Firebase Storage SDK from retrying failed uploads for minutes
try {
  storage.maxUploadRetryTime = 6000;
  storage.maxOperationRetryTime = 6000;
} catch {
  // Ignore in environments where storage properties are read-only
}

export { app, auth, db, storage, analytics };
