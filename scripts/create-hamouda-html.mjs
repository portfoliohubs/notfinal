/**
 * Simple script to create HTML for Dr. Hamouda using existing template
 * This avoids Firebase dependency issues by using hardcoded data structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the buildDoctorStaticHtml function
const { buildDoctorStaticHtml } = await import('./doctor-template.mjs');

// Sample doctor data structure (this should be replaced with actual Firebase data)
const hamoudaDoctorData = {
  id: 'hamouda-doctor-id',
  username: 'hamouda',
  slug: 'hamouda',
  fullName: 'Dr. Hamouda',
  fullNameAr: 'د. حمودة',
  title: 'Dentist',
  titleAr: 'طبيب أسنان',
  university: 'Faculty of Dentistry',
  universityAr: 'كلية طب الأسنان',
  graduationYear: '2020',
  clinicName: 'Hamouda Dental Clinic',
  clinicNameAr: 'عيادة حمودة لطب الأسنان',
  locationAddress: 'Cairo, Egypt',
  locationAddressAr: 'القاهرة، مصر',
  phone: '+201000000000',
  whatsapp: '+201000000000',
  email: 'dr.hamouda@example.com',
  profilePhoto: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
  profilePhotoPath: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  status: 'published',
  active: true,
  
  // Skills
  clinicalSkills: [
    'Oral Surgery',
    'Endodontics',
    'Prosthodontics',
    'Cosmetic Dentistry'
  ],
  clinicalSkillsAr: [
    'جراحة الفم',
    'علاج الجذور',
    'التركيبات الثابتة والمتحركة',
    'طب الأسنان التجميلي'
  ],
  digitalSkills: [
    'Digital Documentation',
    'Dental Photography',
    'Computer-Aided Design'
  ],
  digitalSkillsAr: [
    'التوثيق الرقمي',
    'التصوير السني',
    'التصميم بمساعدة الحاسوب'
  ],
  softSkills: [
    'Patient Communication',
    'Treatment Planning',
    'Team Leadership'
  ],
  softSkillsAr: [
    'التواصل مع المرضى',
    'تخطيط العلاج',
    'القيادة الجماعية'
  ],
  
  // Timeline
  timeline: [
    {
      year: '2015',
      event: 'Started Faculty of Dentistry',
      eventAr: 'بدء الدراسة في كلية طب الأسنان'
    },
    {
      year: '2020',
      event: 'Graduated from Faculty of Dentistry',
      eventAr: 'التخرج من كلية طب الأسنان'
    },
    {
      year: '2021',
      event: 'Started Clinical Practice',
      eventAr: 'بدء الممارسة السريرية'
    },
    {
      year: '2023',
      event: 'Opened Private Clinic',
      eventAr: 'افتتاح عيادة خاصة'
    }
  ],
  
  // Cases (placeholder - should be replaced with actual Firebase data)
  // Using different field names to test the template's flexibility
  cases: [
    {
      category: 'cosmetic',
      customCategory: 'Cosmetic Dentistry',
      alt: 'Smile Makeover with Porcelain Veneers',
      alt_ar: 'تجميل الابتسامة بالقشور الخزفية',
      description: 'Complete smile transformation using porcelain veneers',
      description_ar: 'تحويل كامل للابتسامة باستخدام القشور الخزفية',
      photo: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      beforePhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      afterPhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      sortOrder: 1
    },
    {
      category: 'endodontics',
      customCategory: 'Root Canal Treatment',
      alt: 'Root Canal Therapy on Molar',
      alt_ar: 'علاج الجذور للضرس الطاحن',
      description: 'Successful root canal treatment on molar tooth',
      description_ar: 'علاج جذر ناجح لضرس طاحن',
      photo: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      beforePhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      afterPhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      sortOrder: 2
    },
    {
      category: 'prosthodontics',
      customCategory: 'Dental Crowns',
      alt: 'E-MAX Crown Placement',
      alt_ar: 'تركيب تاج E-MAX',
      description: 'Placement of E-MAX ceramic crown for aesthetic restoration',
      description_ar: 'تركيب تاج خزفي E-MAX للترميم الجمالي',
      photo: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      beforePhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      afterPhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      sortOrder: 3
    },
    {
      category: 'pediatric',
      customCategory: 'Pediatric Dentistry',
      alt: 'Pediatric Dental Extraction',
      alt_ar: 'خلع سن طفولي',
      description: 'Gentle extraction of primary tooth in pediatric patient',
      description_ar: 'خلع لطيف لسن لبني في مريض طفولي',
      photo: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      beforePhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      afterPhotoUrl: 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
      sortOrder: 4
    }
  ]
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function main() {
  const baseUrl = 'https://portfoliohubs.github.io';
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🚀 Starting Dr. Hamouda HTML generation using template...\n');
  
  try {
    // Generate HTML using the template
    console.log('🔨 Generating HTML using doctor-template.mjs...');
    const htmlContent = buildDoctorStaticHtml({
      doctor: hamoudaDoctorData,
      cases: hamoudaDoctorData.cases,
      baseUrl: baseUrl
    });
    
    // Create output directory
    const doctorHtmlDir = path.join(publicDir, 'dr', 'hamouda');
    ensureDir(doctorHtmlDir);
    
    // Save HTML
    const htmlPath = path.join(doctorHtmlDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    
    console.log(`✅ HTML generated: ${htmlPath}`);
    console.log(`📁 File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);
    
    // Save JSON data for reference
    const jsonData = {
      doctor: hamoudaDoctorData,
      generatedAt: new Date().toISOString(),
      note: 'This is sample data - replace with actual Firebase data'
    };
    
    const jsonPath = path.join(doctorHtmlDir, 'data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`📋 JSON data saved: ${jsonPath}`);
    
    console.log(`\n✨ Done! The site is now available at:`);
    console.log(`🌐 ${baseUrl}/dr/hamouda/`);
    console.log(`\n⚠️  Note: This uses sample data. Update the script with actual Firebase data for Dr. Hamouda.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();