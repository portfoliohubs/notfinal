import * as fs from 'fs';
import * as path from 'path';
import { buildDoctorStaticHtml } from './doctor-template.mjs';

const rawData = JSON.parse(fs.readFileSync('content/drmichaelnabil.json', 'utf8'));

// Flatten cases
const casesList = [];
if (Array.isArray(rawData.clinicalCases)) {
  for (const group of rawData.clinicalCases) {
    const cat = group.category || 'cosmetic';
    const catAr = group.category_ar || 'تجميل الأسنان';
    if (Array.isArray(group.cases)) {
      for (const item of group.cases) {
        casesList.push({
          category: cat.toLowerCase().includes('endo') ? 'endodontics' : 
                    cat.toLowerCase().includes('prostho') || cat.toLowerCase().includes('crown') || cat.toLowerCase().includes('bridge') ? 'prosthodontics' :
                    cat.toLowerCase().includes('pediatric') ? 'pediatric' : 'cosmetic',
          customCategory: cat,
          title: item.alt || item.description || 'Clinical Case',
          titleAr: item.alt_ar || item.description_ar || 'حالة علاجية',
          description: item.description || item.alt || '',
          descriptionAr: item.description_ar || item.alt_ar || '',
          photo: item.photo,
          beforePhotoUrl: item.photo,
          afterPhotoUrl: item.photo,
        });
      }
    }
  }
}

const doctor = {
  id: 'drmichaelnabil',
  uid: 'drmichaelnabil',
  slug: 'drmichaelnabil',
  username: 'drmichaelnabil',
  fullName: rawData.hero?.name || 'Dr. Michael Nabil',
  fullNameAr: rawData.heroAr?.name || 'د. مايكل نبيل',
  title: 'Dentist, Programmer & AI Expert',
  titleAr: 'طبيب أسنان، مبرمج وخبير ذكاء اصطناعي',
  university: 'Zagazig University Hospital & Faculty of Dentistry',
  universityAr: 'مستشفى جامعة الزقازيق وكلية طب الأسنان',
  graduationYear: rawData.education?.graduation_year || '2025',
  clinicName: 'Dr. Michael Nabil Dental Practice & PortfolioHubs Founder HQ',
  clinicNameAr: 'عيادة د. مايكل نبيل ومقر تأسيس PortfolioHubs',
  locationAddress: 'Zagazig, Sharkia, Egypt',
  locationAddressAr: 'الزقازيق، محافظة الشرقية، مصر',
  phone: '+201271476215',
  whatsapp: '201271476215',
  email: 'michaelnabilofficial1@gmail.com',
  bookingLink: 'https://wa.me/201271476215',
  profilePhoto: rawData.hero?.profile_image || 'https://github.com/user-attachments/assets/97ba84f2-8190-4ea6-b396-c6beb0bb3572',
  profilePhotoPath: 'examples/dr-michael-nabil.jpg',
  status: 'published',
  approved: true,
  instagram: 'https://www.instagram.com/michaelnabilofficial/',
  facebook: 'https://www.facebook.com/Micky1000000',
  linkedin: 'https://www.linkedin.com/in/michaelnabilofficial',
  sameAs: [
    'https://orcid.org/0009-0004-9122-3841',
    'https://scholar.google.com/citations?user=portfoliohubs',
    'https://www.linkedin.com/in/michaelnabilofficial',
    'https://github.com/portfoliohubs',
    'https://github.com/michaelnabil',
    'https://huggingface.co/portfoliohubs',
    'https://www.producthunt.com/@portfoliohubs',
    'https://medium.com/@portfoliohubs',
    'https://www.facebook.com/Micky1000000',
    'https://www.instagram.com/michaelnabilofficial/'
  ],
  clinicalSkills: rawData.skills?.clinical || ['Oral Surgery', 'Endodontics', 'Prosthodontics', 'Cosmetic Dentistry'],
  clinicalSkillsAr: rawData.skillsAr?.clinical || ['جراحة الفم', 'علاج الجذور', 'التركيبات الثابتة والمتحركة', 'طب الأسنان التجميلي'],
  digitalSkills: rawData.skills?.digital || ['Dental portfolio creator full coding', 'dental website full coding', 'Digital Documentation'],
  digitalSkillsAr: rawData.skillsAr?.digital || ['برمجة وإنشاء ملفات الأعمال السنية بالكامل', 'برمجة وإنشاء مواقع طب الأسنان بالكامل', 'التوثيق الرقمي'],
  softSkills: rawData.skills?.soft || ['Patient Communication', 'Treatment Planning', 'Time Management'],
  softSkillsAr: rawData.skillsAr?.soft || ['التواصل مع المرضى', 'تخطيط العلاج', 'إدارة الوقت'],
  timeline: (rawData.education?.timeline || []).map((t, idx) => ({
    year: t.year || '2025',
    event: t.event || '',
    eventAr: rawData.educationAr?.timeline?.[idx]?.event || t.event || ''
  })),
  cases: casesList
};

// 1. Update content/public-websites.json
let currentWebsites = [];
try {
  currentWebsites = JSON.parse(fs.readFileSync('content/public-websites.json', 'utf8'));
} catch (e) {
  currentWebsites = [];
}

const existingIdx = currentWebsites.findIndex(w => w.slug === 'drmichaelnabil' || w.slug === 'michael');
if (existingIdx >= 0) {
  currentWebsites[existingIdx] = doctor;
} else {
  currentWebsites.push(doctor);
}

fs.writeFileSync('content/public-websites.json', JSON.stringify(currentWebsites, null, 2), 'utf8');
console.log('✅ Updated content/public-websites.json with Dr. Michael Nabil');

// 2. Generate HTML
const baseUrl = 'https://portfoliohubs.github.io';
const staticHtml = buildDoctorStaticHtml({
  doctor,
  cases: casesList,
  baseUrl
});

// Output directories to ensure all URL patterns work:
// - /dr/drmichaelnabil/index.html
// - /drmichaelnabil/index.html
// - /dr/michael/index.html
const targetDirs = [
  'public/dr/drmichaelnabil',
  'public/drmichaelnabil',
  'public/drdrmichaelnabil',
  'public/dr/michael'
];

for (const dir of targetDirs) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), staticHtml, 'utf8');
  console.log(`✅ Written static HTML to: ${dir}/index.html (${staticHtml.length} bytes)`);
}

console.log('🎉 Dr. Michael Nabil static pages generated successfully!');
