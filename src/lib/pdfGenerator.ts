import jsPDF from 'jspdf';
import CONFIG from '../config';

export interface CvData {
  fullName: string;
  title: string;
  graduationYear: string;
  university: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  profilePhoto: string | null;
  skills: { clinical: string[]; digital: string[]; soft: string[] };
  timeline: Array<{ year: string; event: string }>;
  cases: Array<{ category: string; title: string; subtitle?: string; photo: string | null }>;
}

export type PdfProgressCallback = (progress: number, stageText: string, estimatedSecondsLeft: number) => void;

const PRIMARY = CONFIG.pdf.primaryColor;
const DARK_BACKGROUND = CONFIG.pdf.backgroundColor;
const DARK_TEXT       = CONFIG.pdf.textColor;
const DARK_MUTED      = CONFIG.pdf.mutedColor;
const DARK_LINE       = CONFIG.pdf.lineColor;

const TEXT    = DARK_TEXT;
const MUTED   = DARK_MUTED;
const LINE    = DARK_LINE;

function applyColor(doc: jsPDF, method: 'fill' | 'draw' | 'text', hex: string) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (method === 'fill') doc.setFillColor(r, g, b);
  else if (method === 'draw') doc.setDrawColor(r, g, b);
  else doc.setTextColor(r, g, b);
}

async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateCvPdf(data: CvData, onProgress?: PdfProgressCallback): Promise<void> {
  const notify = (percent: number, msg: string, secs: number) => {
    if (onProgress) {
      onProgress(Math.min(100, Math.max(0, percent)), msg, Math.max(0, secs));
    }
  };

  notify(10, 'بدء تهيئة أبعاد المستند والقالب الطبي A4...', 4);
  await delay(120);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, ML = 18, MR = 18, CW = W - ML - MR;
  const FOOTER_Y = H - 8;

  function fillPageBackground() {
    applyColor(doc, 'fill', DARK_BACKGROUND);
    doc.rect(0, 0, W, H, 'F');
  }

  fillPageBackground();

  let y = 0;

  // ── PAGE 1: COVER ────────────────────────────────────────────────────────────
  notify(25, 'معالجة الصورة الشخصية وتنسيق بيانات الغلاف...', 3);
  await delay(150);

  // Profile photo — centered, aspect ratio preserved, max 85mm
  if (data.profilePhoto?.startsWith('data:image')) {
    try {
      const dims = await getImageDimensions(data.profilePhoto);
      const maxSize = 85;
      const aspect = dims.width / dims.height;
      let pw = maxSize, ph = maxSize;
      if (aspect > 1) { ph = maxSize / aspect; } else { pw = maxSize * aspect; }
      const px = W / 2 - pw / 2, py = 26;
      doc.addImage(data.profilePhoto, 'WEBP', px, py, pw, ph, undefined, 'FAST');
      y = py + ph + 14;
    } catch {
      y = 90;
    }
  } else {
    y = 90;
  }

  // Name — large, centered, uppercase (Enhanced font size 26pt)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  applyColor(doc, 'text', TEXT);
  doc.text((data.fullName || 'Your Name').toUpperCase(), W / 2, y, { align: 'center' });
  y += 12;

  // Title (Enhanced font size 15pt)
  if (data.title) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    applyColor(doc, 'text', PRIMARY);
    doc.text(data.title, W / 2, y, { align: 'center' });
    y += 10;
  }

  // University / graduation (Enhanced font size 12pt)
  if (data.graduationYear || data.university) {
    doc.setFontSize(12);
    applyColor(doc, 'text', MUTED);
    const parts = [
      data.graduationYear && `Graduated: ${data.graduationYear}`,
      data.university || undefined,
    ].filter(Boolean).join('  •  ');
    doc.text(parts, W / 2, y, { align: 'center' });
    y += 16;
  } else {
    y += 8;
  }

  // Contact info row — centered icons / text (Enhanced font size 11pt)
  const contacts: Array<{ label: string; text: string; url?: string }> = [];
  if (data.phone)    contacts.push({ label: 'Phone', text: data.phone });
  if (data.whatsapp) contacts.push({
    label: 'WhatsApp', text: data.whatsapp,
    url: `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`,
  });
  if (data.email)    contacts.push({ label: 'Email', text: data.email, url: `mailto:${data.email}` });
  if (data.website)  contacts.push({ label: 'Portfolio', text: data.website, url: data.website });

  if (contacts.length > 0) {
    applyColor(doc, 'draw', LINE);
    doc.setLineWidth(0.6);
    doc.line(ML + 15, y, W - MR - 15, y);
    y += 9;
    contacts.forEach(c => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      applyColor(doc, 'text', TEXT);
      const contactStr = `${c.label}: ${c.text}`;
      doc.text(contactStr, W / 2, y, { align: 'center' });
      if (c.url) doc.link(ML, y - 4, CW, 7, { url: c.url });
      y += 8;
    });
  }

  notify(45, 'تنسيق أقسام المهارات المهنية والجدول الزمني...', 2);
  await delay(120);

  // ── PAGE 2: SKILLS ───────────────────────────────────────────────────────────
  const hasSkills = (data.skills.clinical?.length || 0) > 0 ||
                    (data.skills.digital?.length  || 0) > 0 ||
                    (data.skills.soft?.length     || 0) > 0;

  if (hasSkills) {
    doc.addPage();
    fillPageBackground();
    y = 26;
    drawSectionTitle('PROFESSIONAL SKILLS', y);
    y += 18;

    const skillGroups = [
      { label: 'Dental & Clinical Skills', items: data.skills.clinical || [] },
      { label: 'Digital & Software Skills', items: data.skills.digital || [] },
      { label: 'Interpersonal & Soft Skills', items: data.skills.soft || [] },
    ].filter(g => g.items.length > 0);

    skillGroups.forEach(g => {
      // Check if space is tight
      if (y > H - 50) {
        doc.addPage();
        fillPageBackground();
        y = 26;
        drawSectionTitle('PROFESSIONAL SKILLS (CONT.)', y);
        y += 18;
      }

      // Group Header (Enhanced 14pt)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      applyColor(doc, 'text', PRIMARY);
      doc.text(g.label.toUpperCase(), ML + 4, y);
      y += 8;

      // Group Items: Each skill strictly on its own distinct line (Enhanced 12pt)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      applyColor(doc, 'text', TEXT);

      g.items.forEach(item => {
        if (y > H - 25) {
          doc.addPage();
          fillPageBackground();
          y = 26;
        }

        // Draw bullet point
        applyColor(doc, 'fill', PRIMARY);
        doc.circle(ML + 7, y - 1.5, 1.2, 'F');

        // Skill Text with line wrapping if long
        applyColor(doc, 'text', TEXT);
        const wrappedLines = doc.splitTextToSize(item, CW - 16);
        doc.text(wrappedLines, ML + 12, y);
        y += (wrappedLines.length * 6) + 3;
      });

      y += 6;
    });
  }

  // ── PAGE 3: TIMELINE / EDUCATION ─────────────────────────────────────────────
  if (data.timeline.length > 0 || data.university) {
    doc.addPage();
    fillPageBackground();
    y = 26;
    drawSectionTitle('EDUCATION & TIMELINE', y);
    y += 18;

    if (data.university) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      applyColor(doc, 'text', TEXT);
      doc.text(data.university, W / 2, y, { align: 'center' });
      y += 9;
    }
    if (data.graduationYear) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      applyColor(doc, 'text', PRIMARY);
      doc.text(`Graduation Year: ${data.graduationYear}`, W / 2, y, { align: 'center' });
      y += 14;
    }

    const sorted = [...data.timeline].sort((a, b) => Number(a.year) - Number(b.year));
    sorted.forEach(item => {
      if (y > H - 25) {
        doc.addPage();
        fillPageBackground();
        y = 26;
      }

      // Year badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      applyColor(doc, 'text', PRIMARY);
      doc.text(`[${item.year}]`, ML + 4, y);

      // Event text wrapped nicely
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      applyColor(doc, 'text', TEXT);
      const wrappedEvent = doc.splitTextToSize(item.event, CW - 24);
      doc.text(wrappedEvent, ML + 24, y);
      y += (wrappedEvent.length * 6) + 4;
    });
  }

  // ── DENTAL CASES ────────────────────────────────────────────────────────────
  const caseCount = data.cases.length;
  if (CONFIG.pdf.showCasesInPdf && caseCount > 0) {
    notify(60, `تضمين وتوليد صفحات حالات الأسنان (${caseCount} حالات)...`, 2);
    
    // Cases section cover page
    doc.addPage();
    fillPageBackground();
    drawSectionTitle('DENTAL CASES PORTFOLIO', H / 2 - 10);

    // One full page per case
    for (let idx = 0; idx < data.cases.length; idx++) {
      const c = data.cases[idx];
      const caseProgress = 60 + Math.round(((idx + 1) / caseCount) * 22);
      notify(caseProgress, `معالجة حالة الأسنان ${idx + 1} من ${caseCount}...`, 1);
      await delay(70);

      doc.addPage();
      fillPageBackground();
      y = 22;

      // Category banner (Enhanced 14pt)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      applyColor(doc, 'text', PRIMARY);
      doc.text((c.category || 'Dental Case').toUpperCase(), W / 2, y, { align: 'center' });
      y += 10;

      // Title (Enhanced 15pt)
      if (c.title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        applyColor(doc, 'text', TEXT);
        const wrappedTitle = doc.splitTextToSize(c.title, CW);
        doc.text(wrappedTitle, W / 2, y, { align: 'center' });
        y += (wrappedTitle.length * 6) + 4;
      }

      // Subtitle / description wrapped nicely (Enhanced 12pt)
      if (c.subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        applyColor(doc, 'text', MUTED);
        const wrappedSub = doc.splitTextToSize(c.subtitle, CW);
        doc.text(wrappedSub, W / 2, y, { align: 'center' });
        y += (wrappedSub.length * 6) + 4;
      }

      // Photo — centered, aspect ratio preserved, fits within available page area
      if (c.photo?.startsWith('data:image')) {
        const photoTop = y + 4;
        const maxH     = FOOTER_Y - photoTop - 12;
        const maxW     = CW;
        if (maxH > 40) {
          try {
            const dims = await getImageDimensions(c.photo);
            const aspect = dims.width / dims.height;
            let pw = maxW, ph = maxH;
            if (aspect > maxW / maxH) { ph = maxW / aspect; }
            else { pw = maxH * aspect; }
            const px = W / 2 - pw / 2;
            doc.addImage(c.photo, 'WEBP', px, photoTop, pw, ph, undefined, 'FAST');
          } catch {}
        }
      }
    }
  }

  // ── COMPLETE PORTFOLIO ────────────────────────────────────────────────────────
  if (data.website) {
    doc.addPage();
    fillPageBackground();
    y = H / 2 - 20;
    drawSectionTitle('ONLINE PORTFOLIO', y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    applyColor(doc, 'text', TEXT);
    doc.text('For the full interactive portfolio and clinical updates, visit:', W / 2, y, { align: 'center' });
    y += 9;

    applyColor(doc, 'text', PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(data.website, W / 2, y, { align: 'center' });
    doc.link(ML, y - 5, CW, 8, { url: data.website });
  }

  notify(88, 'ترقيم الصفحات وتطبيق ترويسة هوية PortfolioHubs...', 1);
  await delay(120);

  // ── RUNNING HEADER + FOOTER (all pages) ────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);

    // Running header on pages 2+
    if (p > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      applyColor(doc, 'text', TEXT);
      doc.text(data.fullName || 'PortfolioHubs Doctor', ML, 12);
      doc.text(`Page ${p} of ${total}`, W - MR, 12, { align: 'right' });
      applyColor(doc, 'draw', LINE);
      doc.setLineWidth(0.4);
      doc.line(ML, 15, W - MR, 15);
    }

    // Footer on all pages
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    applyColor(doc, 'text', MUTED);
    doc.text(
      `${CONFIG.pdf.footerText} ${data.fullName || 'PortfolioHubs'}`,
      W / 2, FOOTER_Y, { align: 'center' }
    );
  }

  notify(96, 'جلب وحفظ ملف الـ PDF وتنزيله إلى المتصفح...', 1);
  await delay(150);

  const safeName = (data.fullName || 'cv').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${safeName}_cv.pdf`);

  notify(100, 'اكتمل تنزيل الـ PDF بنجاح!', 0);
  await delay(400);

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function drawSectionTitle(title: string, yPos: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    applyColor(doc, 'text', TEXT);
    const tw = doc.getTextWidth(title);
    const hw = tw / 2 + 6;
    applyColor(doc, 'draw', LINE);
    doc.setLineWidth(0.6);
    doc.line(ML, yPos - 1.5, W / 2 - hw, yPos - 1.5);
    doc.line(W / 2 + hw, yPos - 1.5, W - MR, yPos - 1.5);
    doc.text(title, W / 2, yPos, { align: 'center' });
  }
}
