import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Link, useRoute } from 'wouter';
import { db } from '../lib/firebase';
import { cloudflareApi } from '../lib/cloudflareApiClient';
import { getCleanDoctorSlug } from '../lib/publicSiteUrl';
import CONFIG from '../config';
import type { PortfolioData } from '../types';

interface PublicWebsiteData extends Partial<PortfolioData> {
  sameAs?: string[];
}

interface PublicWebsiteProps {
  slug?: string;
  params?: { slug?: string };
}

export default function PublicWebsite({ slug: propSlug, params }: PublicWebsiteProps = {}) {
  const [, compactParams] = useRoute('/dr:slug');
  const [, slashParams] = useRoute('/dr/:slug');
  const [, directParams] = useRoute('/:slug');
  
  const pathnameSlug = typeof window !== 'undefined' 
    ? window.location.pathname.replace(/^\/dr\/?/, '').replace(/^\/+|\/+$/g, '') 
    : '';

  const rawSlug = propSlug || params?.slug || slashParams?.slug || compactParams?.slug || directParams?.slug || pathnameSlug || '';
  const slug = getCleanDoctorSlug(rawSlug);

  const [website, setWebsite] = useState<PublicWebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive UI State matching template
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    let active = true;
    const loadWebsite = async () => {
      setLoading(true);
      setError('');
      try {
        const cleanSlug = slug;
        if (!cleanSlug) {
          throw new Error('لم يتم تحديد عنوان الموقع المطلوب.');
        }

        // Direct check for Dr. Michael Nabil
        if (cleanSlug === 'drmichaelnabil' || cleanSlug === 'michaelnabil' || cleanSlug === 'michael') {
          window.location.replace('https://portfoliohubs.github.io/drmichaelnabil');
          return;
        }

        // Check if matches a live example
        const matchingExample = (CONFIG.portfolioIntro.liveExamples ?? []).find(
          ex => ex.link.toLowerCase().replace(/^\/+|\/+$/g, '') === cleanSlug
        );
        if (matchingExample) {
          window.location.replace(`https://portfoliohubs.github.io/${matchingExample.link}`);
          return;
        }

        // 1. Try Cloudflare Worker API endpoint first
        try {
          const response = await cloudflareApi.getPublishedWebsite(cleanSlug);
          if (active && response?.data) {
            setWebsite(response.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('[PublicWebsite] Cloudflare API notice:', apiError);
        }

        // 2. Check slugs collection in Firestore
        let uid = '';
        let slugSnap = await getDoc(doc(db, 'slugs', cleanSlug));
        if (!slugSnap.exists()) {
          slugSnap = await getDoc(doc(db, 'slugs', `dr-${cleanSlug}`));
        }
        if (!slugSnap.exists() && cleanSlug.startsWith('dr-')) {
          slugSnap = await getDoc(doc(db, 'slugs', cleanSlug.replace(/^dr-/, '')));
        }
        if (slugSnap.exists()) {
          uid = slugSnap.data().uid || '';
        } else {
          uid = cleanSlug;
        }

        // 3. Load portfolio by UID
        if (uid) {
          let websiteSnapshot = await getDoc(doc(db, 'published_portfolios', uid));
          if (!websiteSnapshot.exists()) {
            websiteSnapshot = await getDoc(doc(db, 'portfolios', uid));
          }
          if (!websiteSnapshot.exists()) {
            websiteSnapshot = await getDoc(doc(db, 'users', uid));
          }

          if (websiteSnapshot.exists() && active) {
            setWebsite(websiteSnapshot.data() as PublicWebsiteData);
            setLoading(false);
            return;
          }
        }

        // 4. Fallback search by slug field in portfolios collection
        try {
          const q = query(
            collection(db, 'portfolios'),
            where('slug', 'in', [cleanSlug, `dr-${cleanSlug}`, `dr${cleanSlug}`]),
            limit(1)
          );
          const qSnap = await getDocs(q);
          if (!qSnap.empty && active) {
            setWebsite(qSnap.docs[0].data() as PublicWebsiteData);
            setLoading(false);
            return;
          }
        } catch (queryErr) {
          console.warn('[PublicWebsite] Query fallback notice:', queryErr);
        }

        throw new Error('هذا الموقع غير متاح حالياً أو لم يتم اعتماده ونشره بعد.');
      } catch (loadError) {
        console.warn('[PublicWebsite] Note:', loadError instanceof Error ? loadError.message : 'Unable to load website');
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل هذا الموقع.');
          setLoading(false);
        }
      }
    };

    void loadWebsite();
    return () => {
      active = false;
    };
  }, [slug]);

  // Sync Dynamic SEO Metadata
  useEffect(() => {
    if (!website) return;
    const cleanSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const displayNameEn = website.fullName || 'Doctor';
    const displayNameAr = website.fullNameAr || website.fullName || 'طبيب أسنان';
    
    document.title = currentLang === 'ar' 
      ? `${displayNameAr} | ${displayNameEn} - PortfolioHubs` 
      : `${displayNameEn} | ${displayNameAr} - PortfolioHubs`;
    
    const description = `${displayNameAr} (${displayNameEn}) - ${website.titleAr || website.title || 'طبيب وجراح أسنان'}. الملف المهني والحالات السريرية وتفاصيل العيادة والتواصل.`;
    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://portfoliohubs.github.io/dr/${cleanSlug}`;
  }, [slug, website, currentLang]);

  // Scroll spy for bottom nav active states
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'skills', 'education', 'cases', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data helpers
  const isAr = currentLang === 'ar';
  const nameEn = website?.fullName || 'Dr. Dentist';
  const nameAr = website?.fullNameAr || website?.fullName || 'د. طبيب أسنان';
  const name = isAr ? nameAr : nameEn;

  const taglineEn = website?.title || 'Dental Surgeon & Specialist';
  const taglineAr = website?.titleAr || website?.title || 'طبيب وجراح أسنان تخصصي';
  const tagline = isAr ? taglineAr : taglineEn;

  const graduationEn = website?.graduationYear ? `Graduated Class of ${website.graduationYear}` : (website?.university || 'Dentistry Graduate');
  const graduationAr = website?.graduationYear ? `دفعة تخرج ${website.graduationYear}` : (website?.universityAr || website?.university || 'خريج طب الأسنان');
  const graduation = isAr ? graduationAr : graduationEn;

  const roleEn = website?.title || 'Dental Practitioner';
  const roleAr = website?.titleAr || 'ممارس طب الأسنان';
  const role = isAr ? roleAr : roleEn;

  const clinicEn = website?.clinicName || 'Dental Practice Clinic';
  const clinicAr = website?.clinicNameAr || website?.clinicName || 'عيادة الأسنان التخصصية';
  const clinic = isAr ? clinicAr : clinicEn;

  const universityEn = website?.university || 'Faculty of Dentistry';
  const universityAr = website?.universityAr || website?.university || 'كلية طب وجراحة الفم والأسنان';
  const university = isAr ? universityAr : universityEn;

  const profilePhoto = website?.profilePhoto || website?.profilePreview || '/logo.png';

  const clinicalSkills = website?.clinicalSkills || ['Comprehensive Dental Care', 'Restorative Dentistry', 'Oral Diagnosis', 'Smile Esthetics'];
  const clinicalSkillsAr = website?.clinicalSkillsAr || ['رعاية سنية شاملة', 'حشوات وترميم الأسنان', 'التشخيص الفموي الدقيق', 'تجميل وتنسيق الابتسامة'];

  const digitalSkills = website?.digitalSkills || ['Digital Smile Design', 'CAD/CAM Workflow', 'Intraoral 3D Scanning'];
  const digitalSkillsAr = website?.digitalSkillsAr || ['تصميم الابتسامة الرقمي DSD', 'تقنيات CAD/CAM الحديثة', 'المسح الفموي الرقمي ثلاثي الأبعاد'];

  const softSkills = website?.softSkills || ['Patient Communication', 'Treatment Planning', 'Case Presentation'];
  const softSkillsAr = website?.softSkillsAr || ['التواصل الفعّال مع المرضى', 'وضع الخطط العلاجية الشاملة', 'شرح وتبسيط خطوات العلاج'];

  const timeline = website?.timeline || [
    { year: website?.graduationYear || '2023', event: `Graduated from ${universityEn}`, eventAr: `التخرج من ${universityAr}` },
    { year: 'Present', event: `Clinical Practitioner at ${clinicEn}`, eventAr: `طبيب ممارس في ${clinicAr}` }
  ];

  const cases = website?.cases || [];

  const address = isAr ? (website?.locationAddressAr || website?.locationAddress) : (website?.locationAddress || website?.locationAddressAr);
  const phone = website?.phone || '';
  const whatsapp = website?.whatsapp || website?.phone || '';
  const email = website?.email || '';

  const whatsappClean = whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = whatsappClean ? `https://wa.me/${whatsappClean}` : '';

  // Handle PDF Generation
  const handleDownloadCvPdf = async () => {
    setDownloadingPdf(true);
    try {
      // Load pdfMake scripts dynamically if not present
      if (!(window as any).pdfMake) {
        await new Promise((resolve) => {
          const s1 = document.createElement('script');
          s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js';
          s1.onload = () => {
            const s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js';
            s2.onload = resolve;
            document.head.appendChild(s2);
          };
          document.head.appendChild(s1);
        });
      }

      const pdfMake = (window as any).pdfMake;
      if (!pdfMake) throw new Error('PDF Engine not ready');

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [50, 60, 50, 60],
        background: () => ({
          canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: '#111827' }]
        }),
        defaultStyle: {
          font: 'Roboto',
          fontSize: 11,
          lineHeight: 1.6,
          color: '#e5e7eb'
        },
        content: [
          { text: nameEn.toUpperCase(), fontSize: 28, bold: true, color: '#ffffff', alignment: 'center', margin: [0, 40, 0, 8] },
          { text: taglineEn, fontSize: 14, color: '#3b82f6', bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
          { text: graduationEn, fontSize: 12, color: '#9ca3af', fontStyle: 'italic', alignment: 'center', margin: [0, 0, 0, 15] },
          {
            canvas: [{ type: 'line', x1: 200, y1: 0, x2: 315, y2: 0, lineWidth: 2, lineColor: '#3b82f6' }],
            alignment: 'center',
            margin: [0, 10, 0, 20]
          },
          phone ? { text: `Phone: ${phone}`, fontSize: 11, alignment: 'center', margin: [0, 2, 0, 2] } : null,
          whatsapp ? { text: `WhatsApp: ${whatsapp}`, fontSize: 11, alignment: 'center', margin: [0, 2, 0, 2] } : null,
          email ? { text: `Email: ${email}`, fontSize: 11, alignment: 'center', margin: [0, 2, 0, 2] } : null,
          { text: `University: ${universityEn}`, fontSize: 11, alignment: 'center', margin: [0, 8, 0, 20] },
          { text: 'PROFESSIONAL SKILLS', fontSize: 16, bold: true, color: '#3b82f6', alignment: 'center', margin: [0, 20, 0, 10] },
          { text: clinicalSkills.join('  •  '), fontSize: 11, alignment: 'center', margin: [0, 0, 0, 15] },
          { text: 'COMPLETE PORTFOLIO & CLINICAL CASES', fontSize: 14, bold: true, color: '#ffffff', alignment: 'center', margin: [0, 30, 0, 10] },
          { text: window.location.href, fontSize: 12, color: '#3b82f6', decoration: 'underline', alignment: 'center' }
        ].filter(Boolean)
      };

      const safeFileName = `${nameEn.replace(/[^a-zA-Z0-9]/g, '_')}_Portfolio.pdf`;
      pdfMake.createPdf(docDefinition).download(safeFileName);
    } catch (e) {
      console.error('PDF error:', e);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111827', color: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: 50, height: 50, border: '4px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 20 }}></div>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Loading Doctor Portfolio...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111827', color: '#f9fafb', padding: 20, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444', fontSize: 28 }}>
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{error || 'الموقع غير متاح حالياً'}</h1>
        <p style={{ color: '#9ca3af', marginBottom: 25, maxWidth: 450, fontSize: 14 }}>لم يتم العثور على هذا البورتفوليو، أو أن حساب الطبيب قيد الاعتماد والمراجعة.</p>
        <Link href="/" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          العودة للرئيسية PortfolioHubs
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="doctor-portfolio-page"
      data-theme={currentTheme}
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        '--primary-color': currentTheme === 'dark' ? '#3b82f6' : '#2563eb',
        '--secondary-color': currentTheme === 'dark' ? '#8b5cf6' : '#7c3aed',
        '--accent-color': currentTheme === 'dark' ? '#22d3ee' : '#06b6d4',
        '--text-color': currentTheme === 'dark' ? '#f9fafb' : '#1f2937',
        '--text-light': currentTheme === 'dark' ? '#d1d5db' : '#6b7280',
        '--bg-color': currentTheme === 'dark' ? '#111827' : '#ffffff',
        '--bg-secondary': currentTheme === 'dark' ? '#1f2937' : '#f9fafb',
        '--border-color': currentTheme === 'dark' ? '#374151' : '#e5e7eb',
        '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '--transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'var(--bg-color)',
        color: 'var(--text-color)',
        minHeight: '100vh',
        fontFamily: isAr ? "'Almarai', -apple-system, sans-serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      } as React.CSSProperties}
    >
      <style>{`
        .doctor-portfolio-page * { box-sizing: border-box; }
        .doctor-portfolio-page .header {
          position: fixed; top: 0; left: 0; right: 0;
          background: var(--bg-color); border-bottom: 1px solid var(--border-color);
          z-index: 1000; box-shadow: var(--shadow);
        }
        .doctor-portfolio-page .header-content {
          max-width: 1200px; margin: 0 auto; padding: 1rem 2rem;
          display: flex; justify-content: space-between; align-items: center;
        }
        .doctor-portfolio-page .menu-btn {
          background: none; border: none; font-size: 1.5rem; color: var(--text-color);
          cursor: pointer; padding: 0.5rem; display: none;
        }
        @media (max-width: 768px) {
          .doctor-portfolio-page .menu-btn { display: block; }
        }
        .doctor-portfolio-page .header-logo { flex: 1; text-align: center; }
        .doctor-portfolio-page .header-name {
          font-size: 1.25rem; font-weight: 600; color: var(--primary-color);
        }
        .doctor-portfolio-page .header-controls { display: flex; gap: 1rem; }
        .doctor-portfolio-page .lang-toggle, .doctor-portfolio-page .theme-toggle {
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;
          color: var(--text-color); display: flex; align-items: center; gap: 0.5rem;
          transition: var(--transition);
        }
        .doctor-portfolio-page .lang-toggle:hover, .doctor-portfolio-page .theme-toggle:hover {
          background: var(--primary-color); color: white; transform: translateY(-2px);
        }
        .doctor-portfolio-page .mobile-nav {
          position: fixed; top: 0; left: -100%; width: 280px; height: 100vh;
          background: var(--bg-color); box-shadow: var(--shadow-lg);
          transition: var(--transition); z-index: 1001; overflow-y: auto;
        }
        .doctor-portfolio-page .mobile-nav.active { left: 0; }
        [dir="rtl"] .doctor-portfolio-page .mobile-nav { left: auto; right: -100%; }
        [dir="rtl"] .doctor-portfolio-page .mobile-nav.active { right: 0; }
        .doctor-portfolio-page .mobile-nav-content { padding: 2rem; }
        .doctor-portfolio-page .close-btn {
          background: none; border: none; font-size: 1.5rem; color: var(--text-color);
          cursor: pointer; padding: 0.5rem; margin-bottom: 2rem;
        }
        .doctor-portfolio-page .nav-links { list-style: none; padding: 0; margin: 0; }
        .doctor-portfolio-page .nav-links li { margin-bottom: 1rem; }
        .doctor-portfolio-page .nav-links a {
          display: block; padding: 1rem; color: var(--text-color); text-decoration: none;
          border-radius: 0.5rem; transition: var(--transition);
        }
        .doctor-portfolio-page .nav-links a:hover {
          background: var(--primary-color); color: white; transform: translateX(10px);
        }
        [dir="rtl"] .doctor-portfolio-page .nav-links a:hover { transform: translateX(-10px); }
        .doctor-portfolio-page .portfolio-container { margin-top: 80px; padding-bottom: 100px; }
        .doctor-portfolio-page .section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .doctor-portfolio-page .section-header { text-align: center; margin-bottom: 3rem; }
        .doctor-portfolio-page .icon-circle {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem; color: white; font-size: 1.5rem;
        }
        .doctor-portfolio-page .section-title {
          font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .doctor-portfolio-page .section-subtitle { color: var(--text-light); font-size: 1.1rem; }
        .doctor-portfolio-page .hero-section { text-align: center; padding: 6rem 2rem; }
        .doctor-portfolio-page .profile-image-container { margin-bottom: 2rem; }
        .doctor-portfolio-page .profile-image {
          width: 200px; height: 200px; border-radius: 50%; object-fit: cover;
          border: 5px solid var(--primary-color); box-shadow: var(--shadow-lg);
        }
        .doctor-portfolio-page .hero-name {
          font-size: 3rem; font-weight: 700; margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .doctor-portfolio-page .hero-tagline { font-size: 1.5rem; color: var(--text-light); margin-bottom: 1rem; }
        .doctor-portfolio-page .hero-graduation { font-size: 1.1rem; color: var(--text-light); margin-bottom: 2rem; }
        .doctor-portfolio-page .hero-position {
          font-size: 1.2rem; padding: 1rem 2rem; background: var(--bg-secondary);
          border-radius: 1rem; display: inline-block;
        }
        .doctor-portfolio-page .skills-container {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;
        }
        .doctor-portfolio-page .skill-category {
          background: var(--bg-secondary); padding: 2rem; border-radius: 1rem;
          border: 1px solid var(--border-color); transition: var(--transition);
        }
        .doctor-portfolio-page .skill-category:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .doctor-portfolio-page .skill-category-title {
          display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem;
          margin-bottom: 1.5rem; color: var(--primary-color);
        }
        .doctor-portfolio-page .skill-list { display: flex; flex-direction: column; gap: 1rem; }
        .doctor-portfolio-page .skill-item {
          display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
          background: var(--bg-color); border-radius: 0.5rem; transition: var(--transition);
        }
        .doctor-portfolio-page .skill-item:hover {
          transform: translateX(10px); background: var(--primary-color); color: white;
        }
        [dir="rtl"] .doctor-portfolio-page .skill-item:hover { transform: translateX(-10px); }
        .doctor-portfolio-page .skill-number {
          width: 30px; height: 30px; background: var(--primary-color); color: white;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 600; flex-shrink: 0;
        }
        .doctor-portfolio-page .skill-item:hover .skill-number { background: white; color: var(--primary-color); }
        .doctor-portfolio-page .education-container { display: flex; flex-direction: column; gap: 3rem; }
        .doctor-portfolio-page .university-info {
          text-align: center; padding: 2rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white; border-radius: 1rem;
        }
        .doctor-portfolio-page .university-name { font-size: 1.8rem; margin-bottom: 0.5rem; }
        .doctor-portfolio-page .timeline-container { padding: 2rem; background: var(--bg-secondary); border-radius: 1rem; }
        .doctor-portfolio-page .timeline-title { font-size: 1.8rem; margin-bottom: 2rem; text-align: center; }
        .doctor-portfolio-page .timeline { position: relative; padding: 2rem 0; }
        .doctor-portfolio-page .timeline::before {
          content: ''; position: absolute; left: 50%; top: 0; bottom: 0;
          width: 2px; background: var(--border-color); transform: translateX(-50%);
        }
        .doctor-portfolio-page .timeline-item { position: relative; margin-bottom: 3rem; display: flex; align-items: center; }
        .doctor-portfolio-page .timeline-item:nth-child(odd) { justify-content: flex-end; padding-right: calc(50% + 2rem); }
        .doctor-portfolio-page .timeline-item:nth-child(even) { justify-content: flex-start; padding-left: calc(50% + 2rem); }
        .doctor-portfolio-page .timeline-marker {
          position: absolute; left: 50%; transform: translateX(-50%);
          width: 20px; height: 20px; background: var(--primary-color);
          border: 4px solid var(--bg-color); border-radius: 50%; z-index: 1;
        }
        .doctor-portfolio-page .timeline-content {
          background: var(--bg-color); padding: 1.5rem; border-radius: 1rem;
          box-shadow: var(--shadow); max-width: 400px;
        }
        .doctor-portfolio-page .timeline-year {
          font-weight: 700; color: var(--primary-color); font-size: 1.2rem; display: block; margin-bottom: 0.5rem;
        }
        .doctor-portfolio-page .cases-container { display: flex; flex-direction: column; gap: 4rem; }
        .doctor-portfolio-page .case-category { padding: 2rem; background: var(--bg-secondary); border-radius: 1rem; }
        .doctor-portfolio-page .case-category-title { font-size: 2rem; margin-bottom: 2rem; text-align: center; color: var(--primary-color); }
        .doctor-portfolio-page .cases-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; justify-items: center;
        }
        .doctor-portfolio-page .case-card {
          background: var(--bg-color); border-radius: 1rem; overflow: hidden;
          box-shadow: var(--shadow); transition: var(--transition); width: 100%; max-width: 420px;
        }
        .doctor-portfolio-page .case-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .doctor-portfolio-page .case-image-wrapper { position: relative; padding-top: 70%; overflow: hidden; }
        .doctor-portfolio-page .case-image {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover; background: var(--bg-secondary);
        }
        .doctor-portfolio-page .case-description { padding: 1.5rem; text-align: center; color: var(--text-light); }
        .doctor-portfolio-page .contact-container { display: flex; flex-direction: column; gap: 3rem; }
        .doctor-portfolio-page .contact-methods {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;
        }
        .doctor-portfolio-page .contact-method {
          display: flex; align-items: center; gap: 1.5rem; padding: 2rem;
          background: var(--bg-secondary); border-radius: 1rem; border: 1px solid var(--border-color);
          text-decoration: none; color: var(--text-color); transition: var(--transition);
        }
        .doctor-portfolio-page .contact-method:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .doctor-portfolio-page .contact-icon {
          width: 60px; height: 60px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 1.5rem; color: white;
        }
        .doctor-portfolio-page .contact-icon.phone { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .doctor-portfolio-page .contact-icon.whatsapp { background: linear-gradient(135deg, #25d366, #128c7e); }
        .doctor-portfolio-page .contact-icon.email { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .doctor-portfolio-page .contact-label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
        .doctor-portfolio-page .contact-value { color: var(--text-light); }
        .doctor-portfolio-page .social-media { text-align: center; padding: 2rem; background: var(--bg-secondary); border-radius: 1rem; }
        .doctor-portfolio-page .social-title { font-size: 1.8rem; margin-bottom: 2rem; }
        .doctor-portfolio-page .social-links { display: flex; justify-content: center; gap: 1.5rem; }
        .doctor-portfolio-page .social-link {
          width: 60px; height: 60px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 1.5rem; color: white;
          text-decoration: none; transition: var(--transition);
        }
        .doctor-portfolio-page .social-link:hover { transform: scale(1.1) rotate(10deg); }
        .doctor-portfolio-page .social-link.instagram { background: linear-gradient(135deg, #f58529, #dd2a7b); }
        .doctor-portfolio-page .social-link.facebook { background: #1877f2; }
        .doctor-portfolio-page .social-link.linkedin { background: #0a66c2; }
        .doctor-portfolio-page .location-container { padding: 2rem; background: var(--bg-secondary); border-radius: 1rem; }
        .doctor-portfolio-page .location-title { font-size: 1.8rem; margin-bottom: 1rem; text-align: center; }
        .doctor-portfolio-page .location-address { text-align: center; color: var(--text-light); margin-bottom: 2rem; }
        .doctor-portfolio-page .map-container { border-radius: 1rem; overflow: hidden; margin-bottom: 1rem; }
        .doctor-portfolio-page .btn {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem;
          border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: var(--transition);
          border: none; cursor: pointer;
        }
        .doctor-portfolio-page .btn-secondary { background: var(--primary-color); color: white; width: 100%; justify-content: center; }
        .doctor-portfolio-page .btn-secondary:hover { background: var(--secondary-color); transform: translateY(-2px); }
        .doctor-portfolio-page .footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: var(--bg-color); border-top: 1px solid var(--border-color); z-index: 999;
        }
        .doctor-portfolio-page .bottom-nav { display: flex; justify-content: space-around; padding: 0.5rem; }
        .doctor-portfolio-page .nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
          padding: 0.5rem 1rem; color: var(--text-light); text-decoration: none;
          transition: var(--transition); border-radius: 0.5rem; font-size: 0.85rem;
        }
        .doctor-portfolio-page .nav-item:hover, .doctor-portfolio-page .nav-item.active {
          color: var(--primary-color); background: var(--bg-secondary);
        }
        .doctor-portfolio-page .nav-item i { font-size: 1.2rem; }
        .doctor-portfolio-page .footer-info {
          text-align: center; padding: 1rem; font-size: 0.85rem;
          color: var(--text-light); border-top: 1px solid var(--border-color);
        }
        @media (max-width: 768px) {
          .doctor-portfolio-page .hero-name { font-size: 2rem; }
          .doctor-portfolio-page .section-title { font-size: 2rem; }
          .doctor-portfolio-page .timeline::before { left: 20px; }
          .doctor-portfolio-page .timeline-item {
            padding-left: 3rem !important; padding-right: 0 !important; justify-content: flex-start !important;
          }
          .doctor-portfolio-page .timeline-marker { left: 20px; }
          .doctor-portfolio-page .nav-item span { display: none; }
          .doctor-portfolio-page .bottom-nav { justify-content: space-between; }
          .doctor-portfolio-page .cases-grid { grid-template-columns: 1fr; }
        }
        .doctor-portfolio-page .floating-btn {
          position: fixed; bottom: 140px; right: 30px; width: 60px; height: 60px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1.5rem; text-decoration: none;
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 998;
          border: none; cursor: pointer; overflow: hidden;
        }
        .doctor-portfolio-page .floating-btn:hover {
          transform: translateY(-5px) scale(1.1); box-shadow: 0 15px 35px rgba(37, 99, 235, 0.4);
        }
        @media (max-width: 768px) {
          .doctor-portfolio-page .floating-btn { bottom: 120px; right: 20px; width: 50px; height: 50px; font-size: 1.2rem; }
        }
      `}</style>

      {/* Header */}
      <header className="header" id="header">
        <div className="header-content">
          <button 
            className="menu-btn" 
            id="menuBtn" 
            aria-label="Menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <i className="fas fa-bars"></i>
          </button>
          
          <div className="header-logo">
            <h1 className="header-name" id="headerName">{name}</h1>
          </div>
          
          <div className="header-controls">
            <button 
              className="lang-toggle" 
              id="langToggle" 
              aria-label="Toggle Language"
              onClick={() => setCurrentLang(l => l === 'en' ? 'ar' : 'en')}
            >
              <i className="fas fa-language"></i>
              <span className="lang-text">{currentLang === 'en' ? 'AR' : 'EN'}</span>
            </button>
            
            <button 
              className="theme-toggle" 
              id="themeToggle" 
              aria-label="Toggle Dark Mode"
              onClick={() => setCurrentTheme(t => t === 'light' ? 'dark' : 'light')}
            >
              <i className={currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
            </button>
          </div>
        </div>
        
        <nav className={`mobile-nav ${mobileNavOpen ? 'active' : ''}`} id="mobileNav">
          <div className="mobile-nav-content">
            <button 
              className="close-btn" 
              id="closeBtn" 
              aria-label="Close"
              onClick={() => setMobileNavOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <ul className="nav-links">
              <li><a href="#home" onClick={() => setMobileNavOpen(false)}>{isAr ? 'الملف الشخصي' : 'Profile'}</a></li>
              <li><a href="#skills" onClick={() => setMobileNavOpen(false)}>{isAr ? 'المهارات' : 'Skills'}</a></li>
              <li><a href="#education" onClick={() => setMobileNavOpen(false)}>{isAr ? 'التعليم' : 'Education'}</a></li>
              <li><a href="#cases" onClick={() => setMobileNavOpen(false)}>{isAr ? 'الحالات السريرية' : 'Clinical Cases'}</a></li>
              <li><a href="#contact" onClick={() => setMobileNavOpen(false)}>{isAr ? 'التواصل' : 'Contact'}</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <div className="portfolio-container">
        
        {/* Hero Section */}
        <section id="home" className="section hero-section">
          <div className="hero-content">
            <div className="profile-image-container">
              <img 
                src={profilePhoto} 
                alt={name}
                className="profile-image"
                id="profileImage"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
            </div>
            
            <h1 className="hero-name" id="heroName">{name}</h1>
            <p className="hero-tagline" id="heroTagline">{tagline}</p>
            <p className="hero-graduation" id="heroGraduation">{graduation}</p>
            
            <div className="hero-position" id="heroPosition">
              <p>
                <span>{isAr ? 'يعمل حالياً كـ ' : 'Now working as '}</span>
                <strong id="heroRole">{role}</strong>
                <span>{isAr ? ' في ' : ' at '}</span>
                <strong id="heroClinic">{clinic}</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="section skills-section">
          <div className="section-header">
            <div className="icon-circle">
              <i className="fas fa-star"></i>
            </div>
            <h2 className="section-title">{isAr ? 'المهارات المهنية' : 'Professional Skills'}</h2>
          </div>
          
          <div className="skills-container">
            <div className="skill-category">
              <h3 className="skill-category-title">
                <i className="fas fa-tooth"></i>
                <span>{isAr ? 'المهارات الإكلينيكية' : 'Clinical Skills'}</span>
              </h3>
              <div className="skill-list" id="clinicalSkills">
                {(isAr ? clinicalSkillsAr : clinicalSkills).map((skill, i) => (
                  <div className="skill-item" key={i}>
                    <span className="skill-number">{i + 1}</span>
                    <span className="skill-text">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="skill-category">
              <h3 className="skill-category-title">
                <i className="fas fa-laptop"></i>
                <span>{isAr ? 'المهارات الرقمية' : 'Digital Skills'}</span>
              </h3>
              <div className="skill-list" id="digitalSkills">
                {(isAr ? digitalSkillsAr : digitalSkills).map((skill, i) => (
                  <div className="skill-item" key={i}>
                    <span className="skill-number">{i + 1}</span>
                    <span className="skill-text">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="skill-category">
              <h3 className="skill-category-title">
                <i className="fas fa-users"></i>
                <span>{isAr ? 'المهارات الشخصية والقيادية' : 'Soft Skills'}</span>
              </h3>
              <div className="skill-list" id="softSkills">
                {(isAr ? softSkillsAr : softSkills).map((skill, i) => (
                  <div className="skill-item" key={i}>
                    <span className="skill-number">{i + 1}</span>
                    <span className="skill-text">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="section education-section">
          <div className="section-header">
            <div className="icon-circle">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h2 className="section-title">{isAr ? 'التعليم والتأهيل' : 'Education & Qualifications'}</h2>
          </div>
          
          <div className="education-container">
            <div className="university-info">
              <h3 className="university-name" id="universityName">{university}</h3>
              {website.graduationYear && (
                <p className="graduation-year">
                  <span>{isAr ? 'سنة التخرج: ' : 'Graduated: '}</span>
                  <span id="gradYear">{website.graduationYear}</span>
                </p>
              )}
            </div>
            
            <div className="timeline-container">
              <h3 className="timeline-title">{isAr ? 'المسيرة المهنية والأكاديمية' : 'Career Timeline'}</h3>
              <div className="timeline" id="timeline">
                {timeline.map((item, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <span className="timeline-year">{item.year}</span>
                      <p className="timeline-event">{isAr ? (item.eventAr || item.event) : (item.event || item.eventAr)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Cases Section */}
        {cases.length > 0 && (
          <section id="cases" className="section cases-section">
            <div className="section-header">
              <div className="icon-circle">
                <i className="fas fa-tooth"></i>
              </div>
              <h2 className="section-title">{isAr ? 'الحالات السريرية' : 'Clinical Cases'}</h2>
              <p className="section-subtitle">{isAr ? 'معرض الحالات الواقعية وتوثيق نتائج العلاج' : 'Documented real patient transformations and treatment results'}</p>
            </div>
            
            <div className="cases-container" id="casesContainer">
              <div className="cases-grid">
                {cases.map((c, idx) => {
                  const caseTitle = isAr ? (c.titleAr || c.title || c.descriptionAr || c.description) : (c.title || c.titleAr || c.description || c.descriptionAr);
                  const caseDesc = isAr ? (c.descriptionAr || c.description) : (c.description || c.descriptionAr);
                  const photoSrc = c.afterPhoto?.url || c.afterPhoto?.previewUrl || c.photos?.[0]?.url || c.photos?.[0]?.previewUrl || c.beforePhoto?.url || '';

                  return (
                    <div className="case-card" key={c.id || idx}>
                      <div className="case-image-wrapper">
                        <img 
                          src={photoSrc} 
                          alt={caseTitle || 'Clinical case'} 
                          className="case-image" 
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="case-description">
                        <h4 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--primary-color)' }}>
                          {c.category || (isAr ? 'حالة سريرية' : 'Treatment Case')}
                        </h4>
                        <p>{caseDesc || caseTitle || (isAr ? 'توثيق سريري متقدم' : 'Advanced clinical documentation')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact" className="section contact-section">
          <div className="section-header">
            <div className="icon-circle">
              <i className="fas fa-envelope"></i>
            </div>
            <h2 className="section-title">{isAr ? 'معلومات التواصل والعيادة' : 'Contact & Appointments'}</h2>
            <p className="section-subtitle">{isAr ? 'تواصل مباشرة لحجز الكشف والاستشارات الطبية' : 'Get in touch for consultations and clinic appointments'}</p>
          </div>
          
          <div className="contact-container">
            <div className="contact-methods" id="contactMethods">
              {phone && (
                <a href={`tel:${phone}`} className="contact-method">
                  <div className="contact-icon phone">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">{isAr ? 'الهاتف المباشر' : 'Phone'}</span>
                    <span className="contact-value" dir="ltr">{phone}</span>
                  </div>
                </a>
              )}

              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-method">
                  <div className="contact-icon whatsapp">
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">{isAr ? 'واتساب' : 'WhatsApp'}</span>
                    <span className="contact-value" dir="ltr">{whatsapp}</span>
                  </div>
                </a>
              )}

              {email && (
                <a href={`mailto:${email}`} className="contact-method">
                  <div className="contact-icon email">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                    <span className="contact-value">{email}</span>
                  </div>
                </a>
              )}
            </div>
            
            {(website.instagram || website.facebook || website.linkedin) && (
              <div className="social-media">
                <h3 className="social-title">{isAr ? 'تابعني على منصات التواصل' : 'Follow Me'}</h3>
                <div className="social-links" id="socialLinks">
                  {website.instagram && (
                    <a 
                      href={website.instagram.startsWith('http') ? website.instagram : `https://instagram.com/${website.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link instagram" 
                      aria-label="Instagram"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  )}
                  {website.facebook && (
                    <a 
                      href={website.facebook.startsWith('http') ? website.facebook : `https://facebook.com/${website.facebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link facebook" 
                      aria-label="Facebook"
                    >
                      <i className="fab fa-facebook"></i>
                    </a>
                  )}
                  {website.linkedin && (
                    <a 
                      href={website.linkedin.startsWith('http') ? website.linkedin : `https://linkedin.com/in/${website.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link linkedin" 
                      aria-label="LinkedIn"
                    >
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {address && (
              <div className="location-container" id="locationContainer">
                <h3 className="location-title">{isAr ? 'موقع العيادة' : 'Clinic Location'}</h3>
                <p className="location-address">{address}</p>
                <div className="map-container">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${clinicEn} ${address}`)}&hl=en&z=14&output=embed`}
                    width="100%" 
                    height="300" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    title="Clinic Location Map"
                  />
                </div>
                <a 
                  href={`https://maps.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinicEn} ${address}`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <i className="fas fa-directions"></i>
                  <span>{isAr ? 'الاتجاهات عبر Google Maps' : 'Get Directions'}</span>
                </a>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Fixed Footer Navigation */}
      <footer className="footer">
        <div className="footer-content">
          <nav className="bottom-nav">
            <a href="#home" className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}>
              <i className="fas fa-user"></i>
              <span>{isAr ? 'الملف' : 'Profile'}</span>
            </a>
            <a href="#skills" className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`}>
              <i className="fas fa-star"></i>
              <span>{isAr ? 'المهارات' : 'Skills'}</span>
            </a>
            <a href="#education" className={`nav-item ${activeSection === 'education' ? 'active' : ''}`}>
              <i className="fas fa-graduation-cap"></i>
              <span>{isAr ? 'التعليم' : 'Education'}</span>
            </a>
            <a href="#cases" className={`nav-item ${activeSection === 'cases' ? 'active' : ''}`}>
              <i className="fas fa-tooth"></i>
              <span>{isAr ? 'الحالات' : 'Cases'}</span>
            </a>
            <a href="#contact" className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}>
              <i className="fas fa-envelope"></i>
              <span>{isAr ? 'تواصل' : 'Contact'}</span>
            </a>
          </nav>
          
          <div className="footer-info">
            <p>© {new Date().getFullYear()} {name}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      {/* Floating Download CV PDF Button */}
      <button 
        type="button" 
        className="floating-btn" 
        id="downloadCvBtn" 
        aria-label="Download CV PDF"
        onClick={handleDownloadCvPdf}
        title={isAr ? 'تحميل السيرة الذاتية PDF' : 'Download CV PDF'}
        disabled={downloadingPdf}
      >
        <i className={downloadingPdf ? 'fas fa-spinner fa-spin' : 'fas fa-file-arrow-down'}></i>
      </button>
    </div>
  );
}
