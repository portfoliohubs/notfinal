import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { buildDoctorStaticHtml } from '../scripts/doctor-template.mjs';

const projectId = process.env.GCLOUD_PROJECT || 'demo-portfoliohubs';
const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
  storage: { rules: await readFile(new URL('../storage.rules', import.meta.url), 'utf8') },
});

const verifiedClaims = (email) => ({ email, email_verified: true });
const adminEmail = 'admin@portfoliohubs.com';

before(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

test('verified lookalike domain accounts are not admins', async () => {
  const db = testEnv.authenticatedContext('lookalike', verifiedClaims('attacker@portfoliohubs.com')).firestore();
  await assertFails(setDoc(doc(db, 'blog_articles', 'unauthorized'), { title: 'No access' }));
});

test('unverified allowlisted emails are not admins', async () => {
  const db = testEnv.authenticatedContext('unverified-admin', { email: adminEmail, email_verified: false }).firestore();
  await assertFails(setDoc(doc(db, 'blog_articles', 'unverified'), { title: 'No access' }));
});

test('a verified explicit admin can write admin data', async () => {
  const db = testEnv.authenticatedContext('admin', verifiedClaims(adminEmail)).firestore();
  await assertSucceeds(setDoc(doc(db, 'blog_articles', 'authorized'), { title: 'Allowed' }));
});

test('admin directory reads are limited to the matching user or an admin', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'admins/alice@example.test'), { email: 'alice@example.test' });
    await setDoc(doc(db, `admins/${adminEmail}`), { email: adminEmail });
  });

  const aliceDb = testEnv.authenticatedContext('alice', verifiedClaims('alice@example.test')).firestore();
  await assertSucceeds(getDoc(doc(aliceDb, 'admins/alice@example.test')));
  await assertFails(getDoc(doc(aliceDb, `admins/${adminEmail}`)));
  await assertFails(setDoc(doc(aliceDb, 'blog_articles/not-an-admin'), { title: 'No access' }));
});

test('regular users cannot change promo redemption counters', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'promo_codes', 'SAVE'), { redeemedCount: 0, maxRedemptions: 1 });
  });

  const db = testEnv.authenticatedContext('alice', verifiedClaims('alice@example.test')).firestore();
  await assertFails(updateDoc(doc(db, 'promo_codes', 'SAVE'), { redeemedCount: 1 }));
});

test('Storage limits writes to owned images and allows reads for published profiles', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'published_portfolios', 'alice'), { slug: 'alice' });
  });

  const ownerStorage = testEnv.authenticatedContext('alice', verifiedClaims('alice@example.test')).storage();
  const imagePath = 'website-media/alice/profile.webp';
  const imageRef = ref(ownerStorage, imagePath);
  await assertSucceeds(uploadBytes(imageRef, new Uint8Array([1, 2, 3]), { contentType: 'image/webp' }));
  await assertFails(uploadBytes(ref(ownerStorage, 'website-media/bob/profile.webp'), new Uint8Array([1]), { contentType: 'image/webp' }));
  await assertFails(uploadBytes(ref(ownerStorage, 'website-media/alice/readme.txt'), new Uint8Array([1]), { contentType: 'text/plain' }));
  await assertFails(uploadBytes(
    ref(ownerStorage, 'website-media/alice/oversized.webp'),
    new Uint8Array(5 * 1024 * 1024 + 1),
    { contentType: 'image/webp' },
  ));

  const publicStorage = testEnv.unauthenticatedContext().storage();
  await assertSucceeds(getBytes(ref(publicStorage, imagePath)));
});

test('static doctor pages reject active URL schemes in links and image sources', () => {
  const html = buildDoctorStaticHtml({
    doctor: {
      fullName: 'Security Test',
      instagram: 'javascript:alert(1)',
      facebook: 'data:text/html,<script>alert(1)</script>',
      profilePhoto: 'data:text/html;base64,PHNjcmlwdD4=',
      cases: [{ photo: 'data:text/html;base64,PHNjcmlwdD4=', title: 'Case' }],
    },
    baseUrl: 'https://portfoliohubs.github.io',
  });

  const hrefs = [...html.matchAll(/\bhref="([^"]*)"/gi)].map((match) => match[1]);
  const imageSources = [...html.matchAll(/\bsrc="([^"]*)"/gi)].map((match) => match[1]);
  const unsafeHrefs = hrefs.filter((value) => /^(?:javascript|data):/i.test(value));
  const unsafeImageSources = imageSources.filter((value) => /^data:text\/html/i.test(value));
  assert.deepEqual(unsafeHrefs, [], `Unsafe href values: ${unsafeHrefs.join(', ')}`);
  assert.deepEqual(unsafeImageSources, [], `Unsafe image sources: ${unsafeImageSources.join(', ')}`);
});
