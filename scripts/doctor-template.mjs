/**
 * PortfolioHubs - Doctor Static Page Template Builder
 * Generates modern, responsive doctor portfolio HTML matching model/index.html
 * Includes:
 * - Dynamic AR/EN language switching
 * - Dark/Light mode toggle
 * - Hero, Skills, Education & Career Timeline
 * - Clinical Cases with Before/After comparison slider
 * - Dedicated Blog & Medical Articles section (after Cases)
 * - Contact & Google Map location
 * - Fixed bottom navigation & floating quick-action button
 * - Schema.org JSON-LD structured data for SEO
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function safeJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

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

function getCategoryLabels(catKey, customCat) {
  const map = {
    implant: { en: 'Dental Implants', ar: 'زراعة الأسنان' },
    ortho: { en: 'Orthodontics', ar: 'تقويم الأسنان' },
    cosmetic: { en: 'Cosmetic Dentistry', ar: 'تجميل الأسنان' },
    endodontics: { en: 'Endodontics & Root Canal', ar: 'علاج الجذور والأعصاب' },
    periodontics: { en: 'Periodontics & Gum Care', ar: 'علاج وجراحة اللثة' },
    pediatric: { en: 'Pediatric Dentistry', ar: 'طب أسنان الأطفال' },
    surgery: { en: 'Oral & Maxillofacial Surgery', ar: 'جراحة الفم والفكين' },
    prosthodontics: { en: 'Prosthodontics & Crowns', ar: 'التركيبات السنية والجسور' },
    restorative: { en: 'Restorative Dentistry', ar: 'حشوات وترميم الأسنان' },
    laser: { en: 'Laser Dentistry', ar: 'طب الأسنان بالليزر' },
    general: { en: 'General Dental Care', ar: 'طب الأسنان العام' }
  };

  if (catKey === 'custom' && customCat) {
    return { en: customCat, ar: customCat };
  }
  return map[catKey] || { en: catKey || 'Dental Treatment', ar: catKey || 'علاج الأسنان' };
}

export function buildDoctorStaticHtml({ doctor, cases = [], baseUrl }) {
  const username = doctor.username || doctor.slug || slugify(doctor.fullName || 'doctor');
  const pageCanonicalUrl = `${baseUrl}/dr/${username}/`;
  const citySlug = slugify(doctor.locationAddress || doctor.locationAddressAr || 'cairo');

  const fullNameEn = escapeHtml(doctor.fullName || 'Dr. Dentist');
  const fullNameAr = escapeHtml(doctor.fullNameAr || doctor.fullName || 'طبيب أسنان');
  const titleEn = escapeHtml(doctor.title || 'Dentist');
  const titleAr = escapeHtml(doctor.titleAr || 'طبيب أسنان');
  const universityEn = escapeHtml(doctor.university || 'Dental Faculty');
  const universityAr = escapeHtml(doctor.universityAr || doctor.university || 'كلية طب الأسنان');
  const gradYear = escapeHtml(doctor.graduationYear || '');
  const clinicNameEn = escapeHtml(doctor.clinicName || 'Dental Clinic');
  const clinicNameAr = escapeHtml(doctor.clinicNameAr || doctor.clinicName || 'عيادة الأسنان');
  const addressEn = escapeHtml(doctor.locationAddress || '');
  const addressAr = escapeHtml(doctor.locationAddressAr || doctor.locationAddress || '');
  const phone = escapeHtml(doctor.phone || '');
  const whatsapp = escapeHtml(doctor.whatsapp || doctor.phone || '');
  const email = escapeHtml(doctor.email || '');

  let profilePhotoUrl = doctor.profilePhotoPath 
    ? `${baseUrl}/${doctor.profilePhotoPath}` 
    : (doctor.profilePhoto || `${baseUrl}/assets/default-doctor-avatar.webp`);

  const pageTitle = `${fullNameEn} | ${fullNameAr} - PortfolioHubs`;
  const metaDesc = `الملف المهني والبورتفوليو المهني المعتمد لـ ${fullNameAr} (${fullNameEn})، ${titleAr} خريج ${universityAr} ${gradYear ? '(' + gradYear + ')' : ''}. شاهد الحالات السريرية والمقالات وتواصل مباشرة.`;

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${pageCanonicalUrl}#person`,
        "name": doctor.fullName || doctor.fullNameAr,
        "alternateName": doctor.fullNameAr,
        "jobTitle": doctor.title || "Dentist",
        "image": profilePhotoUrl,
        "email": doctor.email ? `mailto:${doctor.email}` : undefined,
        "telephone": doctor.phone || doctor.whatsapp || undefined,
        "alumniOf": doctor.university ? {
          "@type": "EducationalOrganization",
          "name": doctor.university
        } : undefined,
        "sameAs": [
          doctor.instagram ? (doctor.instagram.startsWith('http') ? doctor.instagram : `https://instagram.com/${doctor.instagram}`) : undefined,
          doctor.facebook ? (doctor.facebook.startsWith('http') ? doctor.facebook : `https://facebook.com/${doctor.facebook}`) : undefined,
          doctor.linkedin ? (doctor.linkedin.startsWith('http') ? doctor.linkedin : `https://linkedin.com/in/${doctor.linkedin}`) : undefined
        ].filter(Boolean)
      },
      {
        "@type": ["Dentist", "LocalBusiness"],
        "@id": `${pageCanonicalUrl}#dentist`,
        "name": doctor.clinicName || doctor.fullNameAr || doctor.fullName,
        "image": profilePhotoUrl,
        "url": pageCanonicalUrl,
        "telephone": doctor.phone || doctor.whatsapp || undefined,
        "address": doctor.locationAddress ? {
          "@type": "PostalAddress",
          "streetAddress": doctor.locationAddress
        } : undefined,
        "employee": {
          "@id": `${pageCanonicalUrl}#person`
        }
      }
    ]
  };

  // Render Skills Lists
  const clinicalSkills = doctor.clinicalSkills || [];
  const clinicalSkillsAr = doctor.clinicalSkillsAr || [];
  const digitalSkills = doctor.digitalSkills || [];
  const digitalSkillsAr = doctor.digitalSkillsAr || [];
  const softSkills = doctor.softSkills || [];
  const softSkillsAr = doctor.softSkillsAr || [];

  const renderSkillList = (enList, arList) => {
    const list = (enList && enList.length > 0) ? enList : (arList || []);
    if (!list || list.length === 0) {
      return '<div class="skill-item"><span class="skill-number">1</span><span class="skill-text" data-en="Comprehensive Dental Care" data-ar="رعاية سنية متكاملة">Comprehensive Dental Care</span></div>';
    }
    return list.map((skill, i) => {
      const en = escapeHtml(skill);
      const ar = escapeHtml((arList && arList[i]) ? arList[i] : skill);
      return `
        <div class="skill-item">
          <span class="skill-number">${i + 1}</span>
          <span class="skill-text" data-en="${en}" data-ar="${ar}">${en}</span>
        </div>
      `;
    }).join('\n');
  };

  // Render Timeline
  const timeline = doctor.timeline || [];
  const renderTimelineHtml = () => {
    if (!timeline || timeline.length === 0) {
      return `
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-year">${gradYear || 'الآن'}</span>
            <p class="timeline-event" data-en="Clinical practice at ${clinicNameEn}" data-ar="ممارسة العمل الإكلينيكي في ${clinicNameAr}">Clinical practice at ${clinicNameEn}</p>
          </div>
        </div>
      `;
    }
    return timeline.map(item => {
      const year = escapeHtml(item.year || '');
      const eventEn = escapeHtml(item.event || item.eventAr || '');
      const eventAr = escapeHtml(item.eventAr || item.event || '');
      return `
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-year">${year}</span>
            <p class="timeline-event" data-en="${eventEn}" data-ar="${eventAr}">${eventEn}</p>
          </div>
        </div>
      `;
    }).join('\n');
  };

  // Render Cases
  const renderCasesHtml = () => {
    if (!cases || cases.length === 0) {
      return `
        <div style="text-align: center; padding: 2.5rem; background: var(--bg-secondary); border-radius: 1rem; color: var(--text-light);">
          <i class="fas fa-tooth" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
          <p data-en="Clinical cases portfolio is being updated. Contact doctor directly for case discussions." data-ar="جاري تحديث سجل الحالات السريرية. يرجى التواصل مع الطبيب مباشرة للاستفسارات العلاجية.">Clinical cases portfolio is being updated. Contact doctor directly for case discussions.</p>
        </div>
      `;
    }

    // Group cases by category
    const grouped = {};
    cases.forEach((c, idx) => {
      const catKey = c.category || 'general';
      const catLabels = getCategoryLabels(catKey, c.customCategory);
      if (!grouped[catKey]) {
        grouped[catKey] = {
          labels: catLabels,
          items: []
        };
      }
      grouped[catKey].items.push({ caseData: c, index: idx });
    });

    return Object.keys(grouped).map(catKey => {
      const group = grouped[catKey];
      const catTitleEn = escapeHtml(group.labels.en);
      const catTitleAr = escapeHtml(group.labels.ar);

      const itemsHtml = group.items.map(({ caseData, index }) => {
        const titleEn = escapeHtml(caseData.title || `Clinical Case #${index + 1}`);
        const titleAr = escapeHtml(caseData.titleAr || caseData.title || `حالة علاجية رقم ${index + 1}`);
        const descEn = escapeHtml(caseData.description || '');
        const descAr = escapeHtml(caseData.descriptionAr || caseData.description || '');
        const treatment = escapeHtml(caseData.treatmentType || '');

        const beforeImg = caseData.beforePhoto?.url ? `${baseUrl}/${caseData.beforePhoto.url}` : (caseData.beforePhotoUrl || caseData.photoPath ? `${baseUrl}/${caseData.photoPath}` : (caseData.photo || ''));
        const afterImg = caseData.afterPhoto?.url ? `${baseUrl}/${caseData.afterPhoto.url}` : (caseData.afterPhotoUrl || caseData.thumbnailPath ? `${baseUrl}/${caseData.thumbnailPath}` : (caseData.preview || beforeImg));
        const hasComparison = beforeImg && afterImg && (beforeImg !== afterImg);

        return `
          <div class="case-card">
            <div class="case-media-box">
              ${hasComparison ? `
                <div class="ba-comparator" data-comparator>
                  <div class="ba-image-layer ba-after">
                    <img src="${escapeAttr(afterImg)}" alt="${escapeAttr(titleAr)} - بعد العلاج (After)" loading="lazy" decoding="async" />
                    <span class="ba-tag tag-after" data-en="After" data-ar="بعد العلاج">After</span>
                  </div>
                  <div class="ba-image-layer ba-before" data-before-layer style="width: 50%;">
                    <img src="${escapeAttr(beforeImg)}" alt="${escapeAttr(titleAr)} - قبل العلاج (Before)" loading="lazy" decoding="async" />
                    <span class="ba-tag tag-before" data-en="Before" data-ar="قبل العلاج">Before</span>
                  </div>
                  <div class="ba-handle" data-handle style="left: 50%;">
                    <div class="ba-handle-line"></div>
                    <div class="ba-handle-button" aria-label="اسحب للمقارنة">
                      <i class="fas fa-arrows-alt-h"></i>
                    </div>
                    <div class="ba-handle-line"></div>
                  </div>
                  <input type="range" min="0" max="100" value="50" class="ba-range-input" data-slider aria-label="مقارنة قبل وبعد العلاج" />
                </div>
              ` : `
                <div class="case-image-wrapper single">
                  <img src="${escapeAttr(afterImg || beforeImg || `${baseUrl}/assets/default-case.webp`)}" alt="${escapeAttr(titleAr)}" class="case-image" loading="lazy" decoding="async" />
                </div>
              `}
            </div>
            
            <div class="case-description">
              <h4 class="case-card-title" data-en="${titleEn}" data-ar="${titleAr}">${titleEn}</h4>
              ${descEn ? `<p class="case-desc-text" data-en="${descEn}" data-ar="${descAr || descEn}">${descEn}</p>` : ''}
              ${treatment ? `<span class="case-badge"><i class="fas fa-check-circle"></i> ${treatment}</span>` : ''}
            </div>
          </div>
        `;
      }).join('\n');

      return `
        <div class="case-category">
          <h3 class="case-category-title" data-en="${catTitleEn}" data-ar="${catTitleAr}">${catTitleEn}</h3>
          <div class="cases-grid">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join('\n');
  };

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeAttr(pageTitle)}</title>
    <meta name="description" content="${escapeAttr(metaDesc)}">
    <meta name="author" content="${escapeAttr(fullNameEn)}">
    <link rel="canonical" href="${escapeAttr(pageCanonicalUrl)}">
    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
    <meta name="theme-color" content="#2563eb">

    <!-- OpenGraph Tags -->
    <meta property="og:type" content="profile">
    <meta property="og:title" content="${escapeAttr(pageTitle)}">
    <meta property="og:description" content="${escapeAttr(metaDesc)}">
    <meta property="og:url" content="${escapeAttr(pageCanonicalUrl)}">
    <meta property="og:site_name" content="PortfolioHubs">
    <meta property="og:image" content="${escapeAttr(profilePhotoUrl)}">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttr(pageTitle)}">
    <meta name="twitter:description" content="${escapeAttr(metaDesc)}">
    <meta name="twitter:image" content="${escapeAttr(profilePhotoUrl)}">

    <link rel="icon" type="image/png" href="https://github.com/user-attachments/assets/fef6c67d-5ed0-4459-b41d-4c288ab48163">

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
      ${safeJsonLd(jsonLdData)}
    </script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        /* CSS Variables */
        :root {
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --secondary-color: #7c3aed;
            --accent-color: #06b6d4;
            --text-color: #1f2937;
            --text-light: #6b7280;
            --bg-color: #ffffff;
            --bg-secondary: #f9fafb;
            --border-color: #e5e7eb;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
            --shadow-lg: 0 10px 25px -3px rgba(37, 99, 235, 0.12);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="dark"] {
            --primary-color: #3b82f6;
            --primary-hover: #60a5fa;
            --secondary-color: #8b5cf6;
            --accent-color: #22d3ee;
            --text-color: #f9fafb;
            --text-light: #9ca3af;
            --bg-color: #0f172a;
            --bg-secondary: #1e293b;
            --border-color: #334155;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
            --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.5);
        }

        /* Reset & Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            transition: var(--transition);
        }

        body[dir="rtl"] {
            font-family: 'Segoe UI', Tahoma, -apple-system, Arial, sans-serif;
        }

        /* Header */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--bg-color);
            border-bottom: 1px solid var(--border-color);
            z-index: 1000;
            box-shadow: var(--shadow);
            backdrop-filter: blur(8px);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0.85rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .menu-btn {
            background: none;
            border: none;
            font-size: 1.4rem;
            color: var(--text-color);
            cursor: pointer;
            padding: 0.5rem;
            display: none;
        }

        @media (max-width: 768px) {
            .menu-btn {
                display: block;
            }
        }

        .header-logo {
            flex: 1;
            text-align: center;
        }

        .header-name {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--primary-color);
            letter-spacing: -0.01em;
        }

        .header-controls {
            display: flex;
            gap: 0.6rem;
        }

        .lang-toggle, .theme-toggle {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 0.45rem 0.85rem;
            border-radius: 0.5rem;
            cursor: pointer;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.85rem;
            font-weight: 600;
            transition: var(--transition);
        }

        .lang-toggle:hover, .theme-toggle:hover {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            transform: translateY(-2px);
        }

        /* Mobile Navigation */
        .mobile-nav {
            position: fixed;
            top: 0;
            left: -100%;
            width: 280px;
            height: 100vh;
            background: var(--bg-color);
            box-shadow: var(--shadow-lg);
            transition: var(--transition);
            z-index: 1001;
            overflow-y: auto;
        }

        .mobile-nav.active {
            left: 0;
        }

        body[dir="rtl"] .mobile-nav {
            left: auto;
            right: -100%;
        }

        body[dir="rtl"] .mobile-nav.active {
            right: 0;
        }

        .mobile-nav-content {
            padding: 2rem 1.5rem;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-color);
            cursor: pointer;
            padding: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .nav-links {
            list-style: none;
        }

        .nav-links li {
            margin-bottom: 0.75rem;
        }

        .nav-links a {
            display: block;
            padding: 0.85rem 1rem;
            color: var(--text-color);
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: var(--transition);
        }

        .nav-links a:hover {
            background: var(--primary-color);
            color: white;
            transform: translateX(8px);
        }

        body[dir="rtl"] .nav-links a:hover {
            transform: translateX(-8px);
        }

        /* Main Content */
        .portfolio-container {
            margin-top: 70px;
            padding-bottom: 90px;
        }

        .section {
            padding: 3.5rem 1.5rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .icon-circle {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            font-size: 1.4rem;
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
        }

        .section-title {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 0.4rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .section-subtitle {
            color: var(--text-light);
            font-size: 1.05rem;
            max-width: 650px;
            margin: 0 auto;
        }

        /* Hero Section */
        .hero-section {
            text-align: center;
            padding: 4rem 1.5rem 2.5rem;
        }

        .profile-image-container {
            margin-bottom: 1.5rem;
        }

        .profile-image {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--primary-color);
            box-shadow: var(--shadow-lg);
        }

        .hero-name {
            font-size: 2.4rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-tagline {
            font-size: 1.25rem;
            color: var(--text-color);
            font-weight: 600;
            margin-bottom: 0.4rem;
        }

        .hero-graduation {
            font-size: 1rem;
            color: var(--text-light);
            margin-bottom: 1.5rem;
        }

        .hero-position {
            font-size: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            display: inline-block;
            box-shadow: var(--shadow);
        }

        /* Skills Section */
        .skills-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }

        .skill-category {
            background: var(--bg-secondary);
            padding: 1.75rem;
            border-radius: 1rem;
            border: 1px solid var(--border-color);
            transition: var(--transition);
        }

        .skill-category:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }

        .skill-category-title {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-color);
        }

        .skill-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .skill-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.65rem 0.85rem;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            font-size: 0.95rem;
        }

        .skill-number {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 700;
            flex-shrink: 0;
        }

        /* Education & Timeline */
        .education-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .university-info {
            text-align: center;
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: 1rem;
            border: 1px solid var(--border-color);
        }

        .university-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .graduation-year {
            color: var(--text-light);
            font-size: 1rem;
        }

        .timeline-container {
            background: var(--bg-secondary);
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid var(--border-color);
        }

        .timeline-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: var(--text-color);
            text-align: center;
        }

        .timeline {
            position: relative;
            padding: 1rem 0;
        }

        .timeline::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 20px;
            width: 3px;
            background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
        }

        body[dir="rtl"] .timeline::before {
            left: auto;
            right: 20px;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 1.75rem;
            padding-left: 3.5rem;
        }

        body[dir="rtl"] .timeline-item {
            padding-left: 0;
            padding-right: 3.5rem;
        }

        .timeline-marker {
            position: absolute;
            top: 4px;
            left: 12px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--bg-color);
            border: 4px solid var(--primary-color);
            box-shadow: 0 0 0 3px var(--bg-secondary);
        }

        body[dir="rtl"] .timeline-marker {
            left: auto;
            right: 12px;
        }

        .timeline-content {
            background: var(--bg-color);
            padding: 1rem 1.25rem;
            border-radius: 0.75rem;
            border: 1px solid var(--border-color);
        }

        .timeline-year {
            display: inline-block;
            font-weight: 800;
            color: var(--primary-color);
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .timeline-event {
            color: var(--text-color);
            font-size: 0.95rem;
            line-height: 1.5;
        }

        /* Cases Section */
        .case-category {
            margin-bottom: 2.5rem;
        }

        .case-category-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 1.25rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.5rem;
        }

        .cases-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
        }

        .case-card {
            background: var(--bg-secondary);
            border-radius: 1rem;
            border: 1px solid var(--border-color);
            overflow: hidden;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
        }

        .case-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }

        .case-media-box {
            position: relative;
            width: 100%;
            background: #000;
            aspect-ratio: 16/10;
            overflow: hidden;
        }

        .case-image-wrapper.single img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        /* Before/After Comparator */
        .ba-comparator {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            user-select: none;
            touch-action: pan-y;
        }

        .ba-image-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .ba-image-layer img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .ba-image-layer.ba-before {
            z-index: 2;
            border-right: 2px solid white;
        }

        body[dir="rtl"] .ba-image-layer.ba-before {
            border-right: none;
            border-left: 2px solid white;
        }

        .ba-tag {
            position: absolute;
            bottom: 10px;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            color: white;
            z-index: 3;
            letter-spacing: 0.02em;
        }

        .tag-after {
            right: 10px;
            background: rgba(16, 185, 129, 0.9);
        }

        .tag-before {
            left: 10px;
            background: rgba(239, 68, 68, 0.9);
        }

        .ba-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 40px;
            margin-left: -20px;
            z-index: 4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }

        .ba-handle-line {
            width: 2px;
            flex: 1;
            background: white;
            box-shadow: 0 0 6px rgba(0,0,0,0.5);
        }

        .ba-handle-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--primary-color);
            border: 2px solid white;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

        .ba-range-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: ew-resize;
            z-index: 5;
            margin: 0;
        }

        .case-description {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            flex: 1;
        }

        .case-card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .case-desc-text {
            font-size: 0.9rem;
            color: var(--text-light);
            line-height: 1.5;
        }

        .case-badge {
            align-self: flex-start;
            margin-top: auto;
            padding: 0.3rem 0.75rem;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--primary-color);
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }

        /* Blog & Articles Section */
        .blog-section {
            background: var(--bg-color);
        }

        .blog-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }

        .blog-card {
            background: var(--bg-secondary);
            border-radius: 1rem;
            border: 1px solid var(--border-color);
            overflow: hidden;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
        }

        .blog-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }

        .blog-image {
            width: 100%;
            height: 170px;
            overflow: hidden;
            background: var(--border-color);
        }

        .blog-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: var(--transition);
        }

        .blog-card:hover .blog-image img {
            transform: scale(1.05);
        }

        .blog-content {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        .blog-meta {
            display: flex;
            gap: 0.85rem;
            font-size: 0.8rem;
            color: var(--text-light);
            margin-bottom: 0.6rem;
        }

        .blog-meta i {
            margin-right: 0.25rem;
        }

        body[dir="rtl"] .blog-meta i {
            margin-right: 0;
            margin-left: 0.25rem;
        }

        .blog-title {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            line-height: 1.4;
        }

        .blog-title a {
            color: var(--text-color);
            text-decoration: none;
            transition: var(--transition);
        }

        .blog-title a:hover {
            color: var(--primary-color);
        }

        .blog-excerpt {
            color: var(--text-light);
            font-size: 0.88rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            flex: 1;
        }

        .blog-read-more {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 700;
            font-size: 0.88rem;
            margin-top: auto;
            transition: var(--transition);
        }

        .blog-read-more:hover {
            color: var(--primary-hover);
            transform: translateX(4px);
        }

        body[dir="rtl"] .blog-read-more:hover {
            transform: translateX(-4px);
        }

        /* Contact Section */
        .contact-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .contact-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
        }

        .contact-method {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 0.75rem;
            text-decoration: none;
            color: var(--text-color);
            transition: var(--transition);
        }

        .contact-method:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-color);
        }

        .contact-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            color: white;
            flex-shrink: 0;
        }

        .contact-icon.phone { background: linear-gradient(135deg, #2563eb, #3b82f6); }
        .contact-icon.whatsapp { background: linear-gradient(135deg, #10b981, #059669); }
        .contact-icon.email { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

        .contact-info {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .contact-label {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-light);
        }

        .contact-value {
            font-size: 1rem;
            font-weight: 600;
            word-break: break-all;
        }

        /* Social Media */
        .social-media {
            text-align: center;
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: 1rem;
            border: 1px solid var(--border-color);
        }

        .social-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 1.25rem;
        }

        .social-link {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.35rem;
            color: white;
            text-decoration: none;
            transition: var(--transition);
        }

        .social-link:hover {
            transform: scale(1.15) rotate(8deg);
        }

        .social-link.instagram { background: linear-gradient(135deg, #f58529, #dd2a7b); }
        .social-link.facebook { background: #1877f2; }
        .social-link.linkedin { background: #0a66c2; }

        /* Location */
        .location-container {
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: 1rem;
            border: 1px solid var(--border-color);
        }

        .location-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-align: center;
        }

        .location-address {
            text-align: center;
            color: var(--text-light);
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        }

        .map-container {
            border-radius: 0.75rem;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.85rem 1.75rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 700;
            transition: var(--transition);
            border: none;
            cursor: pointer;
        }

        .btn-secondary {
            background: var(--primary-color);
            color: white;
            width: 100%;
            justify-content: center;
        }

        .btn-secondary:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-color);
            border-top: 1px solid var(--border-color);
            z-index: 999;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }

        .bottom-nav {
            display: flex;
            justify-content: space-around;
            padding: 0.4rem;
            max-width: 800px;
            margin: 0 auto;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.2rem;
            padding: 0.4rem 0.8rem;
            color: var(--text-light);
            text-decoration: none;
            transition: var(--transition);
            border-radius: 0.5rem;
            font-size: 0.78rem;
            font-weight: 600;
        }

        .nav-item:hover, .nav-item.active {
            color: var(--primary-color);
            background: var(--bg-secondary);
        }

        .nav-item i {
            font-size: 1.15rem;
        }

        .footer-info {
            text-align: center;
            padding: 0.6rem;
            font-size: 0.75rem;
            color: var(--text-light);
            border-top: 1px solid var(--border-color);
        }

        /* Floating Button */
        .floating-btn {
            position: fixed;
            bottom: 110px;
            right: 25px;
            width: 54px;
            height: 54px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.35rem;
            text-decoration: none;
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 998;
            border: none;
            cursor: pointer;
        }

        body[dir="rtl"] .floating-btn {
            right: auto;
            left: 25px;
        }

        .floating-btn:hover {
            transform: translateY(-4px) scale(1.1);
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.5);
        }

        @media (max-width: 768px) {
            .hero-name { font-size: 1.9rem; }
            .section-title { font-size: 1.75rem; }
            .nav-item span { display: none; }
            .bottom-nav { justify-content: space-between; }
            .floating-btn { bottom: 95px; width: 48px; height: 48px; font-size: 1.2rem; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header" id="header">
        <div class="header-content">
            <button class="menu-btn" id="menuBtn" aria-label="Menu">
                <i class="fas fa-bars"></i>
            </button>
            
            <div class="header-logo">
                <h1 class="header-name" id="headerName" data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</h1>
            </div>
            
            <div class="header-controls">
                <button class="lang-toggle" id="langToggle" aria-label="Toggle Language">
                    <i class="fas fa-language"></i>
                    <span class="lang-text">AR</span>
                </button>
                
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle Dark Mode">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        </div>
        
        <!-- Mobile Navigation -->
        <nav class="mobile-nav" id="mobileNav">
            <div class="mobile-nav-content">
                <button class="close-btn" id="closeBtn" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <ul class="nav-links">
                    <li><a href="#home" data-en="Profile" data-ar="الملف التعريفي">Profile</a></li>
                    <li><a href="#skills" data-en="Skills" data-ar="المهارات والخبرات">Skills</a></li>
                    <li><a href="#education" data-en="Education" data-ar="المسيرة الأكاديمية">Education</a></li>
                    <li><a href="#cases" data-en="Clinical Cases" data-ar="الحالات السريرية">Clinical Cases</a></li>
                    <li><a href="#blog" data-en="Articles" data-ar="المقالات الطبية">Articles</a></li>
                    <li><a href="#contact" data-en="Contact" data-ar="التواصل والحجز">Contact</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <!-- Main Content Container -->
    <div class="portfolio-container">
        <!-- 1. Hero Section -->
        <section id="home" class="section hero-section">
            <div class="hero-content">
                <div class="profile-image-container">
                    <img 
                        src="${escapeAttr(profilePhotoUrl)}" 
                        alt="${escapeAttr(fullNameEn)}"
                        data-alt-en="${escapeAttr(fullNameEn)}"
                        data-alt-ar="${escapeAttr(fullNameAr)}"
                        class="profile-image"
                        id="profileImage"
                    />
                </div>
                
                <h1 class="hero-name" id="heroName" data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</h1>
                <p class="hero-tagline" id="heroTagline" data-en="${titleEn}" data-ar="${titleAr}">${titleEn}</p>
                <p class="hero-graduation" id="heroGraduation" data-en="Graduated from ${universityEn} ${gradYear ? '(' + gradYear + ')' : ''}" data-ar="خريج ${universityAr} ${gradYear ? 'دفعة ' + gradYear : ''}">Graduated from ${universityEn} ${gradYear ? '(' + gradYear + ')' : ''}</p>
                
                <div class="hero-position" id="heroPosition">
                    <p>
                        <span data-en="Practicing as" data-ar="يمارس عمله كـ">Practicing as</span>
                        <strong id="heroRole" data-en="${titleEn}" data-ar="${titleAr}">${titleEn}</strong>
                        <span data-en="at" data-ar="في">at</span>
                        <strong id="heroClinic" data-en="${clinicNameEn}" data-ar="${clinicNameAr}">${clinicNameEn}</strong>
                    </p>
                </div>
            </div>
        </section>

        <!-- 2. Skills Section -->
        <section id="skills" class="section skills-section">
            <div class="section-header">
                <div class="icon-circle">
                    <i class="fas fa-star"></i>
                </div>
                <h2 class="section-title" data-en="Clinical Skills & Expertise" data-ar="المهارات السريرية والخبرات">Clinical Skills & Expertise</h2>
                <p class="section-subtitle" data-en="Specialized medical competence, advanced digital dentistry tools, and patient care skills." data-ar="كفاءات طبية تخصصية، أحدث التقنيات الرقمية، ومهارات الرعاية والتواصل مع المرضى.">Specialized medical competence, advanced digital dentistry tools, and patient care skills.</p>
            </div>
            
            <div class="skills-container">
                <div class="skill-category">
                    <h3 class="skill-category-title">
                        <i class="fas fa-tooth"></i>
                        <span data-en="Clinical Skills" data-ar="المهارات الإكلينيكية">Clinical Skills</span>
                    </h3>
                    <div class="skill-list" id="clinicalSkills">
                        ${renderSkillList(clinicalSkills, clinicalSkillsAr)}
                    </div>
                </div>
                
                <div class="skill-category">
                    <h3 class="skill-category-title">
                        <i class="fas fa-laptop-medical"></i>
                        <span data-en="Digital Dentistry" data-ar="طب الأسنان الرقمي">Digital Dentistry</span>
                    </h3>
                    <div class="skill-list" id="digitalSkills">
                        ${renderSkillList(digitalSkills, digitalSkillsAr)}
                    </div>
                </div>
                
                <div class="skill-category">
                    <h3 class="skill-category-title">
                        <i class="fas fa-user-nurse"></i>
                        <span data-en="Patient Care & Soft Skills" data-ar="رعاية المرضى والتواصل">Patient Care & Soft Skills</span>
                    </h3>
                    <div class="skill-list" id="softSkills">
                        ${renderSkillList(softSkills, softSkillsAr)}
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. Education Section -->
        <section id="education" class="section education-section">
            <div class="section-header">
                <div class="icon-circle">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <h2 class="section-title" data-en="Education & Career Timeline" data-ar="المسيرة الأكاديمية والمهنية">Education & Career Timeline</h2>
                <p class="section-subtitle" data-en="Academic degrees, clinical certifications, and milestones in dental practice." data-ar="المؤهلات العلمية، التدريب التخصصي، والمحطات المهنية المعتمدة.">Academic degrees, clinical certifications, and milestones in dental practice.</p>
            </div>
            
            <div class="education-container">
                <div class="university-info">
                    <h3 class="university-name" id="universityName" data-en="${universityEn}" data-ar="${universityAr}">${universityEn}</h3>
                    <p class="graduation-year">
                        <span data-en="Graduation Year" data-ar="سنة التخرج">Graduation Year</span>: <span id="gradYear">${gradYear || 'N/A'}</span>
                    </p>
                </div>
                
                <div class="timeline-container">
                    <h3 class="timeline-title" data-en="Career Journey & Key Milestones" data-ar="محطات المسيرة المهنية والتدريب">Career Journey & Key Milestones</h3>
                    <div class="timeline" id="timeline">
                        ${renderTimelineHtml()}
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. Cases Section -->
        <section id="cases" class="section cases-section">
            <div class="section-header">
                <div class="icon-circle">
                    <i class="fas fa-tooth"></i>
                </div>
                <h2 class="section-title" data-en="Documented Clinical Cases" data-ar="الحالات السريرية الموثقة">Documented Clinical Cases</h2>
                <p class="section-subtitle" data-en="Real clinical outcomes before and after specialized dental treatments." data-ar="نماذج موثقة من الحالات العلاجية ونتائج قبل وبعد التدخل الطبي التخصصي.">Real clinical outcomes before and after specialized dental treatments.</p>
            </div>
            
            <div class="cases-container" id="casesContainer">
                ${renderCasesHtml()}
            </div>
        </section>

        <!-- 5. Articles / Blog Section (Right After Cases) -->
        <section id="blog" class="section blog-section">
            <div class="section-header">
                <div class="icon-circle">
                    <i class="fas fa-newspaper"></i>
                </div>
                <h2 class="section-title" data-en="Dental Articles & Patient Guides" data-ar="المقالات والنصائح الطبية">Dental Articles & Patient Guides</h2>
                <p class="section-subtitle" data-en="Evidence-based dental guides, treatment overviews, and oral health tips." data-ar="إرشادات طبية موثوقة، شروحات للعلاجات السنية، ونصائح متخصصة لصحة الفم والأسنان.">Evidence-based dental guides, treatment overviews, and oral health tips.</p>
            </div>
            
            <div class="blog-container" id="blogContainer">
                <!-- Article 1: Patient Guide -->
                <article class="blog-card">
                    <div class="blog-image">
                        <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80" alt="دليل المريض الشامل للعناية بصحة الفم والأسنان" loading="lazy" />
                    </div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar-alt"></i> ${new Date().getFullYear()}</span>
                            <span><i class="far fa-user"></i> <span data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</span></span>
                        </div>
                        <h3 class="blog-title">
                            <a href="${baseUrl}/dr/${username}/articles/patient-guide.html" data-en="Comprehensive Patient Guide to Dental Care & Prevention" data-ar="دليل المريض الشامل للعناية بصحة الفم والأسنان والوقاية">Comprehensive Patient Guide to Dental Care & Prevention</a>
                        </h3>
                        <p class="blog-excerpt" data-en="Essential daily oral hygiene recommendations, preventive measures, and when to seek professional dental care." data-ar="أهم النصائح الوقائية اليومية للحفاظ على صحة الأسنان واللثة وتجنب التسوس والمشاكل الشائعة.">Essential daily oral hygiene recommendations, preventive measures, and when to seek professional dental care.</p>
                        <a href="${baseUrl}/dr/${username}/articles/patient-guide.html" class="blog-read-more">
                            <span data-en="Read Article" data-ar="قراءة المقال">Read Article</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>

                <!-- Article 2: Clinical Cases & Treatments -->
                <article class="blog-card">
                    <div class="blog-image">
                        <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80" alt="الحالات السريرية والتقنيات العلاجية" loading="lazy" />
                    </div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar-alt"></i> ${new Date().getFullYear()}</span>
                            <span><i class="far fa-user"></i> <span data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</span></span>
                        </div>
                        <h3 class="blog-title">
                            <a href="${baseUrl}/dr/${username}/articles/clinical-cases.html" data-en="Clinical Protocols & Advanced Treatment Procedures" data-ar="البروتوكولات السريرية وأحدث الإجراءات العلاجية في طب الأسنان">Clinical Protocols & Advanced Treatment Procedures</a>
                        </h3>
                        <p class="blog-excerpt" data-en="In-depth analysis of modern diagnostic techniques, restorative dental therapies, and clinical case management." data-ar="استعراض للأساليب التشخيصية المتقدمة، خطط العلاج التخصصية، ومراحل توثيق الحالات الإكلينيكية.">In-depth analysis of modern diagnostic techniques, restorative dental therapies, and clinical case management.</p>
                        <a href="${baseUrl}/dr/${username}/articles/clinical-cases.html" class="blog-read-more">
                            <span data-en="Read Article" data-ar="قراءة المقال">Read Article</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>

                <!-- Article 3: Local Dental Practice -->
                <article class="blog-card">
                    <div class="blog-image">
                        <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80" alt="خدمات طب الأسنان المتخصصة" loading="lazy" />
                    </div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar-alt"></i> ${new Date().getFullYear()}</span>
                            <span><i class="far fa-user"></i> <span data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</span></span>
                        </div>
                        <h3 class="blog-title">
                            <a href="${baseUrl}/dr/${username}/articles/dentist-in-${citySlug}.html" data-en="Premier Dental Services & Patient Care in ${addressEn || 'the Region'}" data-ar="أفضل خدمات طب الأسنان ورعاية المرضى في ${addressAr || 'المنطقة'}">Premier Dental Services & Patient Care in ${addressEn || 'the Region'}</a>
                        </h3>
                        <p class="blog-excerpt" data-en="Overview of specialized clinic services, state-of-the-art sterilization, and comfortable patient experience." data-ar="تفاصيل الخدمات الطبية المتاحة بالعيادة، معايير التعقيم والجودة، وتجربة المريض المريحة.">Overview of specialized clinic services, state-of-the-art sterilization, and comfortable patient experience.</p>
                        <a href="${baseUrl}/dr/${username}/articles/dentist-in-${citySlug}.html" class="blog-read-more">
                            <span data-en="Read Article" data-ar="قراءة المقال">Read Article</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>

                <!-- Article 4: Biography & Academic Journey -->
                <article class="blog-card">
                    <div class="blog-image">
                        <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80" alt="السيرة المهنية والمسيرة الأكاديمية" loading="lazy" />
                    </div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar-alt"></i> ${new Date().getFullYear()}</span>
                            <span><i class="far fa-user"></i> <span data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</span></span>
                        </div>
                        <h3 class="blog-title">
                            <a href="${baseUrl}/dr/${username}/articles/about.html" data-en="Professional Biography & Academic Dental Journey" data-ar="السيرة المهنية والمسيرة الأكاديمية للدكتور">Professional Biography & Academic Dental Journey</a>
                        </h3>
                        <p class="blog-excerpt" data-en="Academic background from ${universityEn}, continuous medical education, and clinical practice philosophies." data-ar="تفاصيل التخرج من ${universityAr}، الدورات التخصصية، والرؤية المهنية في تقديم أفضل علاج للمرضى.">Academic background from ${universityEn}, continuous medical education, and clinical practice philosophies.</p>
                        <a href="${baseUrl}/dr/${username}/articles/about.html" class="blog-read-more">
                            <span data-en="Read Article" data-ar="قراءة المقال">Read Article</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            </div>
        </section>

        <!-- 6. Contact Section -->
        <section id="contact" class="section contact-section">
            <div class="section-header">
                <div class="icon-circle">
                    <i class="fas fa-envelope"></i>
                </div>
                <h2 class="section-title" data-en="Contact & Clinic Appointments" data-ar="التواصل وحجز المواعيد">Contact & Clinic Appointments</h2>
                <p class="section-subtitle" data-en="Connect directly with the doctor or clinic reception for consultations and appointments." data-ar="تواصل مباشرة مع الطبيب أو إدارة العيادة لحجز المواعيد والاستشارات الطبية.">Connect directly with the doctor or clinic reception for consultations and appointments.</p>
            </div>
            
            <div class="contact-container">
                <div class="contact-methods" id="contactMethods">
                    ${phone ? `
                    <a href="tel:${phone}" class="contact-method">
                        <div class="contact-icon phone">
                            <i class="fas fa-phone-alt"></i>
                        </div>
                        <div class="contact-info">
                            <span class="contact-label" data-en="Phone Consultation" data-ar="الهاتف والاتصال المباشر">Phone Consultation</span>
                            <span class="contact-value">${phone}</span>
                        </div>
                    </a>
                    ` : ''}

                    ${whatsapp ? `
                    <a href="https://wa.me/${cleanWhatsapp}" target="_blank" rel="noopener noreferrer" class="contact-method">
                        <div class="contact-icon whatsapp">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <div class="contact-info">
                            <span class="contact-label" data-en="WhatsApp Direct" data-ar="واتساب مباشر">WhatsApp Direct</span>
                            <span class="contact-value">${whatsapp}</span>
                        </div>
                    </a>
                    ` : ''}

                    ${email ? `
                    <a href="mailto:${email}" class="contact-method">
                        <div class="contact-icon email">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="contact-info">
                            <span class="contact-label" data-en="Official Email" data-ar="البريد الإلكتروني">Official Email</span>
                            <span class="contact-value">${email}</span>
                        </div>
                    </a>
                    ` : ''}
                </div>
                
                ${(doctor.instagram || doctor.facebook || doctor.linkedin) ? `
                <div class="social-media">
                    <h3 class="social-title" data-en="Follow on Social Networks" data-ar="متابعة الحسابات الرسمية">Follow on Social Networks</h3>
                    <div class="social-links" id="socialLinks">
                        ${doctor.instagram ? `<a href="${doctor.instagram.startsWith('http') ? doctor.instagram : 'https://instagram.com/' + doctor.instagram}" target="_blank" rel="noopener noreferrer" class="social-link instagram" aria-label="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                        ${doctor.facebook ? `<a href="${doctor.facebook.startsWith('http') ? doctor.facebook : 'https://facebook.com/' + doctor.facebook}" target="_blank" rel="noopener noreferrer" class="social-link facebook" aria-label="Facebook"><i class="fab fa-facebook"></i></a>` : ''}
                        ${doctor.linkedin ? `<a href="${doctor.linkedin.startsWith('http') ? doctor.linkedin : 'https://linkedin.com/in/' + doctor.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link linkedin" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${addressAr || addressEn ? `
                <div class="location-container" id="locationContainer">
                    <h3 class="location-title" data-en="Clinic Location" data-ar="موقع العيادة">Clinic Location</h3>
                    <p class="location-address" data-en="${addressEn || addressAr}" data-ar="${addressAr || addressEn}">${addressEn || addressAr}</p>
                    <div class="map-container">
                        <iframe 
                            src="https://www.google.com/maps?q=${encodeURIComponent((doctor.clinicName || '') + ' ' + (addressAr || addressEn))}&hl=ar&z=14&output=embed"
                            width="100%" 
                            height="280" 
                            style="border:0;" 
                            allowfullscreen="" 
                            loading="lazy"
                            title="Clinic Location Map">
                        </iframe>
                    </div>
                    <a 
                        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((doctor.clinicName || '') + ' ' + (addressAr || addressEn))}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="btn btn-secondary">
                        <i class="fas fa-directions"></i>
                        <span data-en="Get Directions on Google Maps" data-ar="احصل على الاتجاهات عبر خرائط جوجل">Get Directions on Google Maps</span>
                    </a>
                </div>
                ` : ''}
            </div>
        </section>
    </div>

    <!-- Fixed Bottom Navigation & Footer -->
    <footer class="footer">
        <div class="footer-content">
            <nav class="bottom-nav">
                <a href="#home" class="nav-item active">
                    <i class="fas fa-user"></i>
                    <span data-en="Profile" data-ar="البروفايل">Profile</span>
                </a>
                <a href="#skills" class="nav-item">
                    <i class="fas fa-star"></i>
                    <span data-en="Skills" data-ar="المهارات">Skills</span>
                </a>
                <a href="#education" class="nav-item">
                    <i class="fas fa-graduation-cap"></i>
                    <span data-en="Education" data-ar="التعليم">Education</span>
                </a>
                <a href="#cases" class="nav-item">
                    <i class="fas fa-tooth"></i>
                    <span data-en="Cases" data-ar="الحالات">Cases</span>
                </a>
                <a href="#blog" class="nav-item">
                    <i class="fas fa-newspaper"></i>
                    <span data-en="Articles" data-ar="المقالات">Articles</span>
                </a>
                <a href="#contact" class="nav-item">
                    <i class="fas fa-envelope"></i>
                    <span data-en="Contact" data-ar="تواصل">Contact</span>
                </a>
            </nav>
            
            <div class="footer-info">
                <p>&copy; <span id="currentYear"></span> <span id="footerName" data-en="${fullNameEn}" data-ar="${fullNameAr}">${fullNameEn}</span>. <span id="rightsReserved" data-en="All medical credentials verified on PortfolioHubs." data-ar="جميع البيانات المهنية معتمدة عبر منصة PortfolioHubs.">All medical credentials verified on PortfolioHubs.</span></p>
            </div>
        </div>
    </footer>

    <!-- Interactive Client Script -->
    <script>
        (function() {
            var currentLang = 'ar';
            var currentTheme = localStorage.getItem('ph_theme') || 'light';

            function initTheme() {
                document.documentElement.setAttribute('data-theme', currentTheme);
                var themeIcon = document.querySelector('#themeToggle i');
                if (themeIcon) {
                    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }

            function initLanguage() {
                document.body.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
                document.documentElement.setAttribute('lang', currentLang);
                updateI18nText();
                updateI18nAlt();
                var langText = document.querySelector('.lang-text');
                if (langText) {
                    langText.textContent = currentLang === 'en' ? 'AR' : 'EN';
                }
            }

            function updateI18nText() {
                document.querySelectorAll('[data-en][data-ar]').forEach(function(el) {
                    var enText = el.getAttribute('data-en');
                    var arText = el.getAttribute('data-ar');
                    if (enText && arText) {
                        el.textContent = currentLang === 'en' ? enText : arText;
                    }
                });
            }

            function updateI18nAlt() {
                document.querySelectorAll('[data-alt-en][data-alt-ar]').forEach(function(el) {
                    var enAlt = el.getAttribute('data-alt-en');
                    var arAlt = el.getAttribute('data-alt-ar');
                    if (enAlt && arAlt) {
                        el.setAttribute('alt', currentLang === 'en' ? enAlt : arAlt);
                    }
                });
            }

            // Theme Toggle Event
            var themeBtn = document.getElementById('themeToggle');
            if (themeBtn) {
                themeBtn.addEventListener('click', function() {
                    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
                    localStorage.setItem('ph_theme', currentTheme);
                    initTheme();
                });
            }

            // Language Toggle Event
            var langBtn = document.getElementById('langToggle');
            if (langBtn) {
                langBtn.addEventListener('click', function() {
                    currentLang = currentLang === 'en' ? 'ar' : 'en';
                    initLanguage();
                });
            }

            // Mobile Navigation Drawer
            var menuBtn = document.getElementById('menuBtn');
            var closeBtn = document.getElementById('closeBtn');
            var mobileNav = document.getElementById('mobileNav');

            if (menuBtn && mobileNav) {
                menuBtn.addEventListener('click', function() {
                    mobileNav.classList.add('active');
                });
            }
            if (closeBtn && mobileNav) {
                closeBtn.addEventListener('click', function() {
                    mobileNav.classList.remove('active');
                });
            }

            document.querySelectorAll('.nav-links a, .bottom-nav .nav-item').forEach(function(link) {
                link.addEventListener('click', function() {
                    if (mobileNav) mobileNav.classList.remove('active');
                    document.querySelectorAll('.bottom-nav .nav-item').forEach(function(item) {
                        item.classList.remove('active');
                    });
                    if (this.classList.contains('nav-item')) {
                        this.classList.add('active');
                    }
                });
            });

            // Active Tab Intersection Observer
            if ('IntersectionObserver' in window) {
                var sections = document.querySelectorAll('.section');
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            var id = entry.target.id;
                            document.querySelectorAll('.bottom-nav .nav-item').forEach(function(item) {
                                item.classList.remove('active');
                                if (item.getAttribute('href') === '#' + id) {
                                    item.classList.add('active');
                                }
                            });
                        }
                    });
                }, { threshold: 0.25 });

                sections.forEach(function(section) {
                    observer.observe(section);
                });
            }

            // Before/After Slider Interaction
            function initComparators() {
                var comparators = document.querySelectorAll('[data-comparator]');
                comparators.forEach(function(comp) {
                    var slider = comp.querySelector('[data-slider]');
                    var beforeLayer = comp.querySelector('[data-before-layer]');
                    var handle = comp.querySelector('[data-handle]');

                    if (!slider || !beforeLayer || !handle) return;

                    function updatePos(val) {
                        var isRtl = document.body.getAttribute('dir') === 'rtl';
                        var pct = Math.max(0, Math.min(100, val));
                        beforeLayer.style.width = pct + '%';
                        if (isRtl) {
                            handle.style.left = 'auto';
                            handle.style.right = pct + '%';
                        } else {
                            handle.style.right = 'auto';
                            handle.style.left = pct + '%';
                        }
                    }

                    slider.addEventListener('input', function(e) {
                        updatePos(e.target.value);
                    });

                    updatePos(50);
                });
            }

            document.addEventListener('DOMContentLoaded', function() {
                initTheme();
                initLanguage();
                initComparators();
                var yr = document.getElementById('currentYear');
                if (yr) yr.textContent = new Date().getFullYear();
            });

            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                initTheme();
                initLanguage();
                initComparators();
                var yr = document.getElementById('currentYear');
                if (yr) yr.textContent = new Date().getFullYear();
            }
        })();
    </script>

    <!-- Floating Action Button Jumping to Cases -->
    <a href="#cases" class="floating-btn" aria-label="View Clinical Cases">
        <i class="fas fa-tooth"></i>
    </a>
</body>
</html>`;
}
