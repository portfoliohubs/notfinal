/**
 * PortfolioHubs - GitHub Actions Image Processing Script
 * 
 * Runs in GitHub Actions CI/CD to:
 * 1. Query ephemeral 'pending_uploads' staging documents from Firestore.
 * 2. Write physical compressed WebP image files to the repository (public/doctors/{slug}/...).
 * 3. Update the corresponding clinical case document in `users/{uid}/cases/{caseId}` with the permanent relative static URL.
 * 4. Permanently delete the ephemeral staging document from Firestore (Zero storage cost, 0 bytes orphaned).
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collectionGroup, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyPortfolioHubsDefaultFallbackApiKey',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'portfoliohubs-update.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'portfoliohubs-update',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'portfoliohubs-update.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '830737909476',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:830737909476:web:7bd5e6fc91aaa303b24ef1'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function slugify(text) {
  if (!text) return 'doctor';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0621-\u064A-]+/g, '')
    .replace(/--+/g, '-');
}

function writeBase64ToFile(filePath, base64Data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Strip data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

async function processPendingUploads() {
  console.log('====================================================');
  console.log('PortfolioHubs - Processing Pending Image Uploads');
  console.log('Target Project:', firebaseConfig.projectId);
  console.log('====================================================\n');

  try {
    const pendingSnap = await getDocs(collectionGroup(db, 'pending_uploads'));
    console.log(`Found ${pendingSnap.size} pending upload document(s).`);

    if (pendingSnap.empty) {
      console.log('No pending uploads found to process. Exiting cleanly.');
      return;
    }

    let processedCount = 0;
    let deletedCount = 0;

    for (const docSnap of pendingSnap.docs) {
      const uploadData = docSnap.data();
      const uploadId = docSnap.id;
      const { uid, targetType, targetId, fileName, base64, thumbnailBase64 } = uploadData;

      console.log(`\n> Processing upload [${uploadId}] for user ${uid} (Target: ${targetType})...`);

      if (!base64 || !uid) {
        console.warn(`! Invalid upload document ${uploadId}, deleting bad record.`);
        await deleteDoc(docSnap.ref);
        continue;
      }

      // 1. Fetch user doctor slug
      let slug = 'dr-' + uid.substring(0, 8);
      try {
        const userDocSnap = await getDoc(doc(db, 'users', uid));
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.slug) {
            slug = userData.slug;
          } else if (userData.fullName) {
            slug = 'dr-' + slugify(userData.fullName);
          }
        }
      } catch (err) {
        console.warn(`Could not resolve user slug for ${uid}:`, err);
      }

      // 2. Determine target directories and file paths
      const safeFileName = fileName || `${targetType}_${Date.now()}.webp`;
      const isCase = targetType === 'case';
      const subFolder = isCase ? 'cases' : 'profile';
      
      const relativeDestDir = path.join('public', 'doctors', slug, subFolder);
      const mainFilePath = path.join(process.cwd(), relativeDestDir, safeFileName);
      const thumbFileName = `thumb_${safeFileName}`;
      const thumbFilePath = path.join(process.cwd(), relativeDestDir, thumbFileName);

      // 3. Write physical WebP files to disk
      const bytesWritten = writeBase64ToFile(mainFilePath, base64);
      console.log(`  ✓ Saved image: ${mainFilePath} (${Math.round(bytesWritten / 1024)} KB)`);

      const publicRelativePath = `doctors/${slug}/${subFolder}/${safeFileName}`;
      let publicThumbRelativePath = publicRelativePath;

      if (thumbnailBase64) {
        const thumbBytes = writeBase64ToFile(thumbFilePath, thumbnailBase64);
        console.log(`  ✓ Saved thumbnail: ${thumbFilePath} (${Math.round(thumbBytes / 1024)} KB)`);
        publicThumbRelativePath = `doctors/${slug}/${subFolder}/${thumbFileName}`;
      }

      // 4. Update the target document in Firestore with static relative path
      if (isCase && targetId) {
        const caseRef = doc(db, 'users', uid, 'cases', targetId);
        await setDoc(caseRef, {
          photoPath: publicRelativePath,
          thumbnailPath: publicThumbRelativePath,
          photo: publicRelativePath,
          preview: publicThumbRelativePath,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`  ✓ Updated case document [${targetId}] with static paths.`);
      } else if (targetType === 'profile') {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
          profilePhotoPath: publicRelativePath,
          profileThumbnailPath: publicThumbRelativePath,
          profilePhoto: publicRelativePath,
          profilePreview: publicThumbRelativePath,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`  ✓ Updated user document [${uid}] with static profile paths.`);
      }

      // 5. PERMANENTLY DELETE ephemeral pending_upload document
      await deleteDoc(docSnap.ref);
      console.log(`  ✓ Permanently purged ephemeral Firestore document [${uploadId}].`);

      processedCount++;
      deletedCount++;
    }

    console.log('\n====================================================');
    console.log(`IMAGE PROCESSING WORKFLOW COMPLETE`);
    console.log(`- Total Images Processed & Saved: ${processedCount}`);
    console.log(`- Ephemeral Firestore Documents Purged: ${deletedCount}`);
    console.log('====================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during pending uploads processing:', error);
    process.exit(1);
  }
}

processPendingUploads();
