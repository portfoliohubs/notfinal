import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { cleanFirestoreData } from './firestoreUtils';
import { ClinicalCase, PortfolioData } from '../types';
import { uploadImageResilient } from './storageHelper';

export interface MigrationReport {
  totalUsersChecked: number;
  migratedUsersCount: number;
  skippedUsersCount: number;
  totalCasesMigrated: number;
  errors: Array<{ uid: string; error: string }>;
  dryRun?: boolean;
  assetsUploaded?: number;
  assetsPending?: number;
}

export interface MigrationOptions {
  dryRun?: boolean;
}

/**
 * Idempotent Single-User Migration Helper
 * Migrates monolithic cases array to independent subcollection documents:
 * `users/{uid}/cases/{caseId}`
 * 
 * Safe to run multiple times:
 * - If already migrated (or no legacy cases), it safely skips without mutation.
 * - Leaves zero orphaned records.
 * - Strips heavy base64 payload from the root document to eliminate 1MB size limit.
 */
export async function migrateUserCasesSubcollection(
  uid: string, 
  legacyData?: any,
  options: MigrationOptions = {}
): Promise<{ migrated: boolean; casesCount: number }> {
  try {
    // 1. Fetch source data if not provided
    let source = legacyData;
    let collectionName = 'portfolios';

    if (!source) {
      const portDoc = await getDoc(doc(db, 'portfolios', uid));
      if (portDoc.exists()) {
        source = portDoc.data();
        collectionName = 'portfolios';
      } else {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          source = userDoc.data();
          collectionName = 'users';
        }
      }
    }

    if (!source) {
      return { migrated: false, casesCount: 0 };
    }

    // 2. Check idempotency: If already migrated or no legacy cases, exit safely
    const legacyCases: any[] = Array.isArray(source.cases) ? source.cases : [];
    
    // Check if subcollection already has cases
    const existingSubCasesSnap = await getDocs(collection(db, 'users', uid, 'cases'));
    if (source.migratedToSubcollection && existingSubCasesSnap.size >= legacyCases.length) {
      return { migrated: false, casesCount: existingSubCasesSnap.size };
    }

    if (legacyCases.length === 0 && existingSubCasesSnap.empty) {
      // Nothing to migrate, just mark migrated
      await setDoc(doc(db, 'users', uid), {
        ...cleanFirestoreData(source),
        cases: [],
        caseCount: 0,
        caseLimit: source.caseLimit || 3,
        migratedToSubcollection: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { migrated: true, casesCount: 0 };
    }

    const uploadLegacyAsset = async (value: unknown, path: string) => {
      if (typeof value !== 'string' || !value.startsWith('data:image')) return value;
      if (options.dryRun) return '';
      return (await uploadImageResilient(uid, path, value)).url;
    };

    const migratePhoto = async (photo: any, path: string) => {
      if (!photo) return photo;
      const source = typeof photo === 'string' ? { url: photo } : { ...photo };
      const dataUrl = source.url || source.previewUrl;
      const uploadedUrl = await uploadLegacyAsset(dataUrl, path);
      return {
        ...source,
        url: typeof uploadedUrl === 'string' && !uploadedUrl.startsWith('data:') ? uploadedUrl : '',
        previewUrl: typeof uploadedUrl === 'string' && !uploadedUrl.startsWith('data:') ? uploadedUrl : '',
      };
    };

    // 3. Batch migrate cases into users/{uid}/cases/{caseId}
    const batch = writeBatch(db);
    let migratedCount = 0;

    for (let index = 0; index < legacyCases.length; index++) {
      const c = legacyCases[index];
      const caseId = c.id || `case_${Date.now()}_${index}`;
      const caseDocRef = doc(db, 'users', uid, 'cases', caseId);

      // Check if already in subcollection to preserve newest edits
      const existingInSub = existingSubCasesSnap.docs.find(d => d.id === caseId);
      if (existingInSub) {
        continue; // Don't overwrite existing subcollection document
      }

      const beforePhoto = await migratePhoto(
        c.beforePhoto || (c.photo ? { url: c.photo, previewUrl: c.preview, role: 'before' } : undefined),
        `migrations/${uid}/cases/${caseId}/before.webp`,
      );
      const afterPhoto = await migratePhoto(c.afterPhoto, `migrations/${uid}/cases/${caseId}/after.webp`);
      const additionalPhotos = [];
      for (let photoIndex = 0; photoIndex < (c.additionalPhotos || []).length; photoIndex++) {
        additionalPhotos.push(await migratePhoto(
          c.additionalPhotos[photoIndex],
          `migrations/${uid}/cases/${caseId}/additional-${photoIndex}.webp`,
        ));
      }
      const photos = [];
      for (let photoIndex = 0; photoIndex < (c.photos || []).length; photoIndex++) {
        photos.push(await migratePhoto(
          c.photos[photoIndex],
          `migrations/${uid}/cases/${caseId}/photo-${photoIndex}.webp`,
        ));
      }

      const casePayload: ClinicalCase = {
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
        patientAge: c.patientAge || '',
        sessionCount: c.sessionCount || 1,
        // If legacy had photo
        beforePhoto,
        afterPhoto,
        additionalPhotos,
        photos,
        photo: '', // Eradicate base64 from subcollection case document
        preview: '',
        sortOrder: index,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!options.dryRun) batch.set(caseDocRef, cleanFirestoreData(casePayload));
      migratedCount++;
    }

    const migratedProfilePhoto = await uploadLegacyAsset(
      source.profilePhoto,
      `migrations/${uid}/profile.webp`,
    );

    // 4. Update the parent doctor document in `users/{uid}`
    // Free the document from massive base64 cases array!
    const userDocRef = doc(db, 'users', uid);
    const sanitizedUserData = {
      ...source,
      uid,
      profilePhoto: typeof migratedProfilePhoto === 'string' && !migratedProfilePhoto.startsWith('data:')
        ? migratedProfilePhoto
        : source.profilePhoto || '',
      profilePreview: typeof migratedProfilePhoto === 'string' && !migratedProfilePhoto.startsWith('data:')
        ? migratedProfilePhoto
        : source.profilePreview || source.profilePhoto || '',
      cases: [], // Decommission monolithic array permanently
      caseCount: legacyCases.length,
      caseLimit: source.caseLimit || 3,
      migratedToSubcollection: true,
      updatedAt: new Date().toISOString()
    };

    if (!options.dryRun) {
      batch.set(userDocRef, cleanFirestoreData(sanitizedUserData), { merge: true });
    }

    // Also update legacy `portfolios/{uid}` if present to avoid sync conflicts
    if (collectionName === 'portfolios') {
      const legacyRef = doc(db, 'portfolios', uid);
      if (!options.dryRun) batch.update(legacyRef, {
        cases: [], // Clear heavy base64
        migratedToSubcollection: true,
        caseCount: legacyCases.length,
        updatedAt: new Date().toISOString()
      });
    }

    if (!options.dryRun) await batch.commit();
    return { migrated: true, casesCount: migratedCount };
  } catch (err: any) {
    console.error(`[migrateUserCasesSubcollection] Failed for UID ${uid}:`, err);
    throw err;
  }
}

/**
 * Runs migration across all existing users in the system.
 * Idempotent, safe, and outputs detailed progress report.
 */
export async function runGlobalDatabaseMigration(
  onProgress?: (processed: number, total: number) => void,
  options: MigrationOptions = {}
): Promise<MigrationReport> {
  const report: MigrationReport = {
    totalUsersChecked: 0,
    migratedUsersCount: 0,
    skippedUsersCount: 0,
    totalCasesMigrated: 0,
    errors: [],
    dryRun: options.dryRun,
    assetsUploaded: 0,
    assetsPending: 0,
  };

  try {
    // 1. Query all users from portfolios and users collections
    const portfolioDocs = await getDocs(collection(db, 'portfolios'));
    const allUids = new Set<string>();
    
    portfolioDocs.forEach(d => allUids.add(d.id));

    // Also include users collection
    try {
      const userDocs = await getDocs(collection(db, 'users'));
      userDocs.forEach(d => allUids.add(d.id));
    } catch (error) {
      console.warn('[runGlobalDatabaseMigration] Could not read users collection:', error);
    }

    const uidsArray = Array.from(allUids);
    report.totalUsersChecked = uidsArray.length;

    for (let i = 0; i < uidsArray.length; i++) {
      const uid = uidsArray[i];
      try {
        const res = await migrateUserCasesSubcollection(uid, undefined, options);
        if (res.migrated) {
          report.migratedUsersCount++;
          report.totalCasesMigrated += res.casesCount;
        } else {
          report.skippedUsersCount++;
        }
      } catch (userErr: any) {
        report.errors.push({
          uid,
          error: userErr.message || String(userErr)
        });
      }
      onProgress?.(i + 1, uidsArray.length);
    }

    return report;
  } catch (globalErr: any) {
    console.error('[runGlobalDatabaseMigration] Global failure:', globalErr);
    throw globalErr;
  }
}
