/**
 * Script to regenerate existing doctor sites with the fixed template
 * Uses data from content/public-websites.json to avoid Firebase dependency
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the buildDoctorStaticHtml function
const { buildDoctorStaticHtml } = await import('./doctor-template.mjs');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function main() {
  const baseUrl = 'https://portfoliohubs.github.io';
  const publicDir = path.join(process.cwd(), 'public');
  const websitesJsonPath = path.join(process.cwd(), 'content', 'public-websites.json');
  
  console.log('🚀 Starting regeneration of existing doctor sites...\n');
  
  // Load existing websites data
  let websites = [];
  try {
    if (fs.existsSync(websitesJsonPath)) {
      websites = JSON.parse(fs.readFileSync(websitesJsonPath, 'utf8'));
      console.log(`📋 Loaded ${websites.length} existing doctors from public-websites.json`);
    }
  } catch (err) {
    console.error('❌ Could not load public-websites.json:', err);
    process.exit(1);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const website of websites) {
    try {
      const username = website.username || website.slug || 'doctor';
      console.log(`\n🔨 Regenerating site for: ${website.fullName || website.fullNameAr} (${username})`);
      
      // Convert website data to doctor format expected by template
      const doctorObj = {
        id: website.id || website.uid,
        username: username,
        slug: username,
        fullName: website.fullName || 'Doctor',
        fullNameAr: website.fullNameAr || website.fullName || 'طبيب',
        title: website.title || 'Dentist',
        titleAr: website.titleAr || 'طبيب أسنان',
        university: website.university || 'Faculty of Dentistry',
        universityAr: website.universityAr || website.university || 'كلية طب الأسنان',
        graduationYear: website.graduationYear || '',
        clinicName: website.clinicName || 'Dental Clinic',
        clinicNameAr: website.clinicNameAr || website.clinicName || 'عيادة الأسنان',
        locationAddress: website.locationAddress || '',
        locationAddressAr: website.locationAddressAr || website.locationAddress || '',
        phone: website.phone || '',
        whatsapp: website.whatsapp || website.phone || '',
        email: website.email || '',
        profilePhoto: website.profilePhoto || website.profilePhotoPath || '',
        profilePhotoPath: website.profilePhotoPath || '',
        instagram: website.instagram || '',
        facebook: website.facebook || '',
        linkedin: website.linkedin || '',
        status: website.status || 'published',
        active: website.active !== false,
        
        // Skills
        clinicalSkills: website.clinicalSkills || [],
        clinicalSkillsAr: website.clinicalSkillsAr || [],
        digitalSkills: website.digitalSkills || [],
        digitalSkillsAr: website.digitalSkillsAr || [],
        softSkills: website.softSkills || [],
        softSkillsAr: website.softSkillsAr || [],
        
        // Timeline
        timeline: website.timeline || [],
        
        // Cases - use the cases from the website data
        cases: website.cases || []
      };
      
      // Generate HTML
      const htmlContent = buildDoctorStaticHtml({
        doctor: doctorObj,
        cases: doctorObj.cases,
        baseUrl: baseUrl
      });
      
      // Create output directory
      const doctorHtmlDir = path.join(publicDir, 'dr', username);
      ensureDir(doctorHtmlDir);
      
      // Save HTML
      const htmlPath = path.join(doctorHtmlDir, 'index.html');
      fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
      
      console.log(`✅ Generated: ${htmlPath} (${(htmlContent.length / 1024).toFixed(2)} KB)`);
      successCount++;
      
    } catch (err) {
      console.error(`❌ Failed to generate site for ${website.fullName}:`, err);
      failCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${successCount} sites regenerated successfully, ${failCount} failed`);
  console.log(`✨ Done! The sites are now available at: ${baseUrl}/dr/{username}/`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});