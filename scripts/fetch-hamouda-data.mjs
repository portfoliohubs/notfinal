/**
 * Script to fetch Dr. Hamouda's data from Firebase and generate proper HTML
 * This script connects to Firebase using client SDK and fetches doctor data
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the buildDoctorStaticHtml function
const { buildDoctorStaticHtml } = await import('./doctor-template.mjs');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD02aD4-o-ZKKWPg_IKLGFFxmDOMg20y2g",
  authDomain: "portfoliohubs-update.firebaseapp.com",
  projectId: "portfoliohubs-update",
  storageBucket: "portfoliohubs-update.firebasestorage.app",
  messagingSenderId: "830737909476",
  appId: "1:830737909476:web:7bd5e6fc91aaa303b24ef1",
  measurementId: "G-EYE00L54C5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch doctor data by username
async function fetchDoctorByUsername(username) {
  console.log(`🔍 Fetching doctor data for username: ${username}`);
  
  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`❌ No doctor found with username: ${username}`);
      return null;
    }
    
    const doctorDoc = querySnapshot.docs[0];
    const doctorData = { id: doctorDoc.id, ...doctorDoc.data() };
    
    console.log(`✅ Found doctor: ${doctorData.fullName || doctorData.fullNameAr}`);
    return doctorData;
  } catch (error) {
    console.error(`❌ Error fetching doctor data:`, error);
    return null;
  }
}

// Function to fetch cases for a doctor
async function fetchDoctorCases(doctorId) {
  console.log(`🔍 Fetching cases for doctor ID: ${doctorId}`);
  
  try {
    const casesRef = collection(db, 'users', doctorId, 'cases');
    const casesSnapshot = await getDocs(casesRef);
    
    if (casesSnapshot.empty) {
      console.log(`⚠️ No cases found for doctor`);
      return [];
    }
    
    const cases = casesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${cases.length} cases`);
    return cases;
  } catch (error) {
    console.error(`❌ Error fetching cases:`, error);
    return [];
  }
}

// Main function
async function main() {
  const username = 'hamouda';
  const baseUrl = 'https://portfoliohubs.github.io';
  
  console.log('🚀 Starting Dr. Hamouda data fetch and HTML generation...\n');
  
  // Fetch doctor data
  const doctor = await fetchDoctorByUsername(username);
  
  if (!doctor) {
    console.log('❌ Could not find doctor data. Exiting.');
    process.exit(1);
  }
  
  // Fetch cases
  const cases = await fetchDoctorCases(doctor.id);
  
  console.log('\n📊 Doctor Data Summary:');
  console.log(`- Name: ${doctor.fullName || doctor.fullNameAr}`);
  console.log(`- Username: ${doctor.username}`);
  console.log(`- Status: ${doctor.status}`);
  console.log(`- Cases: ${cases.length}`);
  
  // Generate HTML
  console.log('\n🔨 Generating HTML...');
  const htmlContent = buildDoctorStaticHtml({
    doctor: doctor,
    cases: cases,
    baseUrl: baseUrl
  });
  
  // Save to file
  const outputDir = path.join(process.cwd(), 'public', 'dr', username);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(outputPath, htmlContent, 'utf-8');
  
  console.log(`✅ HTML generated successfully: ${outputPath}`);
  console.log(`📁 File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);
  
  // Also save JSON data for reference
  const jsonData = {
    doctor: doctor,
    cases: cases,
    generatedAt: new Date().toISOString()
  };
  
  const jsonPath = path.join(outputDir, 'data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`📋 JSON data saved: ${jsonPath}`);
  
  console.log('\n✨ Done! You can now view the generated HTML at:');
  console.log(`🌐 ${baseUrl}/dr/${username}/`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});