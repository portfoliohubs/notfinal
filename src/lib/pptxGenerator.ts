import pptxgen from 'pptxgenjs';
import { CvData } from './pdfGenerator';
import CONFIG from '../config';

export type PptxProgressCallback = (progress: number, stageText: string, estimatedSecondsLeft: number) => void;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateCvPptx(data: CvData, onProgress?: PptxProgressCallback): Promise<void> {
  const notify = (percent: number, msg: string, secs: number) => {
    if (onProgress) {
      onProgress(Math.min(100, Math.max(0, percent)), msg, Math.max(0, secs));
    }
  };

  notify(10, 'بدء تهيئة العرض التقديمي PPTX بنسبة 16:9...', 3);
  await delay(100);

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.author = data.fullName || 'PortfolioHubs Doctor';
  pptx.title = `${data.fullName || 'Doctor'} - Professional Dental CV`;

  const PRIMARY = '0E7490'; // Cyan-700
  const DARK_BG = '0F172A'; // Slate-900
  const CARD_BG = '1E293B'; // Slate-800
  const TEXT_LIGHT = 'F8FAFC';
  const TEXT_MUTED = '94A3B8';
  const ACCENT = '06B6D4';

  // ─────────────────────────────────────────────────────────────────────────────
  // SLIDE 1: COVER / PROFILE
  // ─────────────────────────────────────────────────────────────────────────────
  notify(25, 'تنسيق شريحة الغلاف والبيانات الشخصية...', 3);
  await delay(120);

  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: DARK_BG };

  // Decorative Accent bar top
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.15,
    fill: { color: PRIMARY },
  });

  // Profile Photo (if present)
  let contentTop = 1.0;
  if (data.profilePhoto && data.profilePhoto.startsWith('data:image')) {
    try {
      coverSlide.addImage({
        data: data.profilePhoto,
        x: 4.1,
        y: 0.7,
        w: 1.8,
        h: 1.8,
        rounding: true,
      });
      contentTop = 2.65;
    } catch {
      contentTop = 1.2;
    }
  }

  // Doctor Name
  coverSlide.addText((data.fullName || 'DR. DENTIST').toUpperCase(), {
    x: 0.5,
    y: contentTop,
    w: 9.0,
    h: 0.6,
    align: 'center',
    fontSize: 26,
    bold: true,
    color: TEXT_LIGHT,
    fontFace: 'Arial',
  });

  // Title
  if (data.title) {
    coverSlide.addText(data.title, {
      x: 0.5,
      y: contentTop + 0.55,
      w: 9.0,
      h: 0.4,
      align: 'center',
      fontSize: 16,
      color: ACCENT,
      fontFace: 'Arial',
    });
  }

  // University & Graduation
  const eduParts = [
    data.graduationYear ? `Graduated ${data.graduationYear}` : '',
    data.university || '',
  ].filter(Boolean).join('  •  ');

  if (eduParts) {
    coverSlide.addText(eduParts, {
      x: 0.5,
      y: contentTop + 0.95,
      w: 9.0,
      h: 0.35,
      align: 'center',
      fontSize: 12,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    });
  }

  // Contact Info Cards (Bottom container)
  const contacts = [
    data.phone ? { label: 'Phone', val: data.phone } : null,
    data.whatsapp ? { label: 'WhatsApp', val: data.whatsapp } : null,
    data.email ? { label: 'Email', val: data.email } : null,
    data.website ? { label: 'Website', val: data.website } : null,
  ].filter(Boolean) as Array<{ label: string; val: string }>;

  if (contacts.length > 0) {
    const cardW = Math.min(2.0, (8.5 / contacts.length) - 0.2);
    const startX = 5.0 - ((contacts.length * (cardW + 0.2) - 0.2) / 2);

    contacts.forEach((c, idx) => {
      const cx = startX + idx * (cardW + 0.2);
      coverSlide.addShape(pptx.ShapeType.roundRect, {
        x: cx,
        y: 4.4,
        w: cardW,
        h: 0.85,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: '334155', width: 1 },
      });
      coverSlide.addText(c.label.toUpperCase(), {
        x: cx,
        y: 4.45,
        w: cardW,
        h: 0.25,
        align: 'center',
        fontSize: 9,
        bold: true,
        color: ACCENT,
        fontFace: 'Arial',
      });
      coverSlide.addText(c.val, {
        x: cx,
        y: 4.7,
        w: cardW,
        h: 0.5,
        align: 'center',
        fontSize: 10,
        color: TEXT_LIGHT,
        fontFace: 'Arial',
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SLIDE 2: PROFESSIONAL SKILLS
  // ─────────────────────────────────────────────────────────────────────────────
  const hasSkills = (data.skills.clinical?.length || 0) > 0 ||
                    (data.skills.digital?.length || 0) > 0 ||
                    (data.skills.soft?.length || 0) > 0;

  if (hasSkills) {
    notify(45, 'تنسيق شريحة المهارات المهنية والتقنية...', 2);
    await delay(120);

    const skillsSlide = pptx.addSlide();
    skillsSlide.background = { color: DARK_BG };

    skillsSlide.addText('PROFESSIONAL SKILLS', {
      x: 0.8,
      y: 0.4,
      w: 8.4,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: ACCENT,
      fontFace: 'Arial',
    });

    const groups = [
      { title: 'Dental & Clinical Skills', items: data.skills.clinical || [] },
      { title: 'Digital & Software Skills', items: data.skills.digital || [] },
      { title: 'Soft & Interpersonal Skills', items: data.skills.soft || [] },
    ].filter(g => g.items.length > 0);

    const colWidth = (8.4 - (groups.length - 1) * 0.3) / groups.length;

    groups.forEach((g, idx) => {
      const gx = 0.8 + idx * (colWidth + 0.3);
      // Card Box
      skillsSlide.addShape(pptx.ShapeType.roundRect, {
        x: gx,
        y: 1.1,
        w: colWidth,
        h: 4.0,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: '334155', width: 1 },
      });

      // Group Header
      skillsSlide.addText(g.title, {
        x: gx + 0.15,
        y: 1.25,
        w: colWidth - 0.3,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: PRIMARY,
        fontFace: 'Arial',
      });

      // Items list (each skill in its own bullet line)
      const bullets = g.items.map(item => ({
        text: `  •  ${item}`,
        options: { fontSize: 11, color: TEXT_LIGHT, breakLine: true },
      }));

      skillsSlide.addText(bullets, {
        x: gx + 0.15,
        y: 1.7,
        w: colWidth - 0.3,
        h: 3.2,
        valign: 'top',
        lineSpacingMultiple: 1.3,
        fontFace: 'Arial',
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SLIDE 3: EDUCATION & TIMELINE
  // ─────────────────────────────────────────────────────────────────────────────
  if (data.university || (data.timeline && data.timeline.length > 0)) {
    notify(65, 'تنسيق شريحة التعليم والمسار المهني...', 2);
    await delay(120);

    const eduSlide = pptx.addSlide();
    eduSlide.background = { color: DARK_BG };

    eduSlide.addText('EDUCATION & CAREER TIMELINE', {
      x: 0.8,
      y: 0.4,
      w: 8.4,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: ACCENT,
      fontFace: 'Arial',
    });

    // University Card
    if (data.university) {
      eduSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.1,
        w: 8.4,
        h: 1.0,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: '334155', width: 1 },
      });

      eduSlide.addText(data.university, {
        x: 1.1,
        y: 1.2,
        w: 6.0,
        h: 0.4,
        fontSize: 15,
        bold: true,
        color: TEXT_LIGHT,
        fontFace: 'Arial',
      });

      if (data.graduationYear) {
        eduSlide.addText(`Graduation Year: ${data.graduationYear}`, {
          x: 1.1,
          y: 1.6,
          w: 6.0,
          h: 0.35,
          fontSize: 12,
          color: ACCENT,
          fontFace: 'Arial',
        });
      }
    }

    // Milestones List
    if (data.timeline && data.timeline.length > 0) {
      const sorted = [...data.timeline].sort((a, b) => Number(a.year) - Number(b.year));
      const startY = data.university ? 2.3 : 1.1;

      eduSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: startY,
        w: 8.4,
        h: 5.2 - startY,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: '334155', width: 1 },
      });

      const timelineTexts = sorted.map(item => ({
        text: `  [${item.year}]  ${item.event}`,
        options: { fontSize: 11.5, color: TEXT_LIGHT, breakLine: true },
      }));

      eduSlide.addText(timelineTexts, {
        x: 1.1,
        y: startY + 0.2,
        w: 7.8,
        h: 4.8 - startY,
        valign: 'top',
        lineSpacingMultiple: 1.4,
        fontFace: 'Arial',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SLIDES 4+: DENTAL CASES
  // ─────────────────────────────────────────────────────────────────────────────
  if (data.cases && data.cases.length > 0) {
    const totalCases = data.cases.length;
    for (let i = 0; i < totalCases; i++) {
      const c = data.cases[i];
      const caseProgress = Math.round(70 + (i / totalCases) * 25);
      notify(caseProgress, `تضمين شريحة حالة الأسنان (${i + 1} من ${totalCases})...`, 1);
      await delay(100);

      const caseSlide = pptx.addSlide();
      caseSlide.background = { color: DARK_BG };

      // Case Category Banner
      caseSlide.addText(`CASE ${i + 1}: ${(c.category || 'DENTAL CASE').toUpperCase()}`, {
        x: 0.8,
        y: 0.4,
        w: 8.4,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: PRIMARY,
        fontFace: 'Arial',
      });

      // Case Title
      caseSlide.addText(c.title || `Treatment Case ${i + 1}`, {
        x: 0.8,
        y: 0.75,
        w: 8.4,
        h: 0.45,
        fontSize: 18,
        bold: true,
        color: TEXT_LIGHT,
        fontFace: 'Arial',
      });

      // Photo and Description
      if (c.photo && c.photo.startsWith('data:image')) {
        try {
          // Left side: Photo
          caseSlide.addImage({
            data: c.photo,
            x: 0.8,
            y: 1.35,
            w: 4.5,
            h: 3.7,
            rounding: true,
          });

          // Right side: Description Card
          caseSlide.addShape(pptx.ShapeType.roundRect, {
            x: 5.5,
            y: 1.35,
            w: 3.7,
            h: 3.7,
            rectRadius: 0.1,
            fill: { color: CARD_BG },
            line: { color: '334155', width: 1 },
          });

          caseSlide.addText('Clinical Notes & Procedure', {
            x: 5.7,
            y: 1.5,
            w: 3.3,
            h: 0.35,
            fontSize: 13,
            bold: true,
            color: ACCENT,
            fontFace: 'Arial',
          });

          caseSlide.addText(c.subtitle || (c as any).description || 'Clinical documentation of restorative treatment, isolation protocol, and final aesthetic contouring.', {
            x: 5.7,
            y: 1.9,
            w: 3.3,
            h: 2.9,
            fontSize: 11,
            color: TEXT_LIGHT,
            valign: 'top',
            lineSpacingMultiple: 1.3,
            fontFace: 'Arial',
          });
        } catch {
          // If image fails, use full width text
          caseSlide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: 1.35,
            w: 8.4,
            h: 3.7,
            rectRadius: 0.1,
            fill: { color: CARD_BG },
            line: { color: '334155', width: 1 },
          });
          caseSlide.addText(c.subtitle || (c as any).description || '', {
            x: 1.1,
            y: 1.6,
            w: 7.8,
            h: 3.2,
            fontSize: 13,
            color: TEXT_LIGHT,
            valign: 'top',
            fontFace: 'Arial',
          });
        }
      } else {
        caseSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 1.35,
          w: 8.4,
          h: 3.7,
          rectRadius: 0.1,
          fill: { color: CARD_BG },
          line: { color: '334155', width: 1 },
        });
        caseSlide.addText(c.subtitle || (c as any).description || '', {
          x: 1.1,
          y: 1.6,
          w: 7.8,
          h: 3.2,
          fontSize: 13,
          color: TEXT_LIGHT,
          valign: 'top',
          fontFace: 'Arial',
        });
      }
    }
  }

  notify(98, 'جارٍ إتمام وحفظ ملف الـ PPTX القابل للتعديل...', 1);
  await delay(100);

  const safeFileName = `${(data.fullName || 'Doctor').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Dental_CV.pptx`;
  await pptx.writeFile({ fileName: safeFileName });
  notify(100, 'تم تنزيل ملف الـ PPTX بنجاح!', 0);
}
