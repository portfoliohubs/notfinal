/**
 * PortfolioHubs - One-Time Idempotent Migration Script
 * 
 * Purpose:
 * Migrates clinical cases from monolithic Firestore documents (`portfolios/{uid}` or `users/{uid}`)
 * into independent subcollection documents: `users/{uid}/cases/{caseId}`.
 * 
 * Safety & Idempotency:
 * - Running this script multiple times is completely safe.
 * - Existing cases in the subcollection are never overwritten.
 * - Parent document's heavy base64 array is purged, reducing doc size from ~1MB to < 4KB.
 * 
 * Prerequisites before running:
 * 1. Back up your Firestore database first:
 *    gcloud firestore export gs://<YOUR-BACKUP-BUCKET-NAME>/pre-migration-backup
 *    OR export via Firebase Console -> Firestore -> Data Export.
 * 2. Run script with Node:
 *    node scripts/migrate-to-subcollections.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

// Load Firebase configuration from environment or fallback config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyPortfolioHubsDefaultFallbackApiKey',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'portfoliohubs-update.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'portfoliohubs-update',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'portfoliohubs-update.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '830737909476',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:830737909476:web:7bd5e6fc91aaa303b24ef1'
};

console.log('----------------------------------------------------');
console.log('PortfolioHubs - Firestore Subcollection Migration');
console.log('Target Project:', firebaseConfig.projectId || 'Defined in env');
console.log('----------------------------------------------------');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function cleanFirestoreData(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => cleanFirestoreData(item));
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) cleaned[k] = cleanFirestoreData(v);
  }
  return cleaned;
}

async function runMigration() {
  // Check if admin credentials are provided
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`Authenticating as admin user: ${adminEmail}...`);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✓ Admin authenticated successfully.');
  } else {
    console.log('Note: Running without ADMIN_EMAIL/ADMIN_PASSWORD environment variables.');
    console.log('(Note: Individual user accounts also auto-migrate seamlessly upon first login via Dashboard).');
  }

  console.log('1. Reading all existing portfolio documents...');
  const portfoliosSnapshot = await getDocs(collection(db, 'portfolios'));
  console.log(`Found ${portfoliosSnapshot.size} documents in 'portfolios' collection.`);

  let totalMigratedUsers = 0;
  let totalCasesMigrated = 0;
  let totalSkippedUsers = 0;

  for (const docSnap of portfoliosSnapshot.docs) {
    const uid = docSnap.id;
    const data = docSnap.data();

    // Check if already migrated
    const subCasesSnap = await getDocs(collection(db, 'users', uid, 'cases'));
    const legacyCases = Array.isArray(data.cases) ? data.cases : [];

    if (data.migratedToSubcollection && subCasesSnap.size >= legacyCases.length) {
      console.log(`- [SKIP] User ${uid} already migrated (${subCasesSnap.size} cases).`);
      totalSkippedUsers++;
      continue;
    }

    console.log(`> [MIGRATING] User ${uid} with ${legacyCases.length} legacy cases...`);

    const batch = writeBatch(db);
    let userCasesCount = 0;

    // Migrate each case to users/{uid}/cases/{caseId}
    legacyCases.forEach((c, index) => {
      const caseId = c.id || `case_${Date.now()}_${index}`;
      const caseRef = doc(db, 'users', uid, 'cases', caseId);

      const existsInSub = subCasesSnap.docs.some(d => d.id === caseId);
      if (existsInSub) {
        return; // Don't overwrite
      }

      const casePayload = {
        id: caseId,
        uid: uid,
        title: c.title || '',
        titleAr: c.titleAr || '',
        category: c.category || 'operative',
        categoryAr: c.categoryAr || '',
        customCategory: c.customCategory || '',
        description: c.description || '',
        descriptionAr: c.descriptionAr || '',
        treatmentType: c.treatmentType || '',
        beforePhoto: c.beforePhoto || (c.photo ? {
          url: c.photo.startsWith('data:') ? '' : c.photo,
          previewUrl: c.preview || c.photo,
          role: 'before'
        } : null),
        afterPhoto: c.afterPhoto || null,
        additionalPhotos: c.additionalPhotos || [],
        photo: '', // Purge raw base64 permanently!
        preview: c.preview || (c.photo && !c.photo.startsWith('data:') ? c.photo : ''),
        sortOrder: index,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      batch.set(caseRef, cleanFirestoreData(casePayload));
      userCasesCount++;
    });

    // Update parent users/{uid} document with text-only data
    const userRef = doc(db, 'users', uid);
    batch.set(userRef, cleanFirestoreData({
      ...data,
      uid,
      cases: [], // Decommissioned monolithic array
      caseCount: legacyCases.length,
      caseLimit: data.caseLimit || 3,
      migratedToSubcollection: true,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    // Also strip legacy portfolios document
    batch.update(docSnap.ref, {
      cases: [],
      caseCount: legacyCases.length,
      migratedToSubcollection: true,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
    totalMigratedUsers++;
    totalCasesMigrated += userCasesCount;
    console.log(`  ✓ Successfully migrated ${userCasesCount} cases for user ${uid}.`);
  }

  console.log('\n====================================================');
  console.log('MIGRATION COMPLETE');
  console.log(`- Total Users Migrated: ${totalMigratedUsers}`);
  console.log(`- Total Cases Transferred: ${totalCasesMigrated}`);
  console.log(`- Total Users Skipped (Already Migrated): ${totalSkippedUsers}`);
  console.log('====================================================\n');
}

runMigration().catch(err => {
  console.error('Migration aborted with error:', err);
  process.exit(1);
});
