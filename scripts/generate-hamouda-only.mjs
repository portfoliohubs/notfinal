/**
 * Modified script to generate HTML only for Dr. Hamouda
 * Based on generate-static-pages.mjs but targeting specific doctor
 */

import { initializeApp as initClientApp } from 'firebase/app';
import { 
  getFirestore as getClientFirestore, 
  collection as clientCollection, 
  getDocs as clientGetDocs, 
  query as clientQuery, 
  where as clientWhere 
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { buildDoctorStaticHtml } from './doctor-template.mjs';

// Firebase client configuration
const firebaseConfig = {
  apiKey: "AIzaSyD02aD4-o-ZKKWPg_IKLGFFxmDOMg20y2g",
  authDomain: "portfoliohubs-update.firebaseapp.com",
  projectId: "portfoliohubs-update",
  storageBucket: "portfoliohubs-update.firebasestorage.app",
  messagingSenderId: "830737909476",
  appId: "1:830737909476:web:7bd5e6fc91aaa303b24ef1",
  measurementId: "G-EYE00L54C5"
};

const clientApp = initClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp);

function slugify(text) {
  if (!text) return 'doctor';
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0621-\u064A-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '') || 'doctor';
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function main() {
  const username = 'hamouda';
  const baseUrl = 'https://portfoliohubs.github.io';
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🚀 Starting Dr. Hamouda HTML generation...\n');
  
  try {
    // Fetch doctor by username
    console.log(`🔍 Fetching doctor data for username: ${username}`);
    const q = clientQuery(
      clientCollection(clientDb, 'users'),
      clientWhere('username', '==', username)
    );
    
    const snap = await clientGetDocs(q);
    
    if (snap.empty) {
      console.log(`❌ No doctor found with username: ${username}`);
      process.exit(1);
    }
    
    const doctorDoc = snap.docs[0];
    const doctor = { id: doctorDoc.id, ...doctorDoc.data() };
    
    console.log(`✅ Found doctor: ${doctor.fullName || doctor.fullNameAr}`);
    console.log(`   Status: ${doctor.status}`);
    console.log(`   Active: ${doctor.active !== false}`);
    
    // Fetch cases
    console.log(`\n🔍 Fetching cases for doctor...`);
    let cases = [];
    try {
      const casesSnap = await clientGetDocs(clientCollection(clientDb, 'users', doctor.id, 'cases'));
      if (!casesSnap.empty) {
        cases = casesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        cases.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    } catch (caseErr) {
      console.warn(`  ⚠️ Could not fetch cases subcollection:`, caseErr.message);
    }
    
    // Fallback to cases in doctor document
    if (cases.length === 0 && Array.isArray(doctor.cases) && doctor.cases.length > 0) {
      cases = doctor.cases;
    }
    
    console.log(`✅ Found ${cases.length} cases`);
    
    // Generate main doctor page
    console.log(`\n🔨 Generating HTML for Dr. ${username}...`);
    const htmlContent = buildDoctorStaticHtml({ doctor, cases, baseUrl });
    
    // Create output directory
    const doctorHtmlDir = path.join(publicDir, 'dr', username);
    ensureDir(doctorHtmlDir);
    
    // Save HTML
    const htmlPath = path.join(doctorHtmlDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    
    console.log(`✅ HTML generated: ${htmlPath}`);
    console.log(`📁 File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);
    
    // Save JSON data for reference
    const jsonData = {
      doctor: doctor,
      cases: cases,
      generatedAt: new Date().toISOString()
    };
    
    const jsonPath = path.join(doctorHtmlDir, 'data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`📋 JSON data saved: ${jsonPath}`);
    
    console.log(`\n✨ Done! The site is now available at:`);
    console.log(`🌐 ${baseUrl}/dr/${username}/`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();