import React, { useState } from 'react';
import { 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { ClinicalCase, ClinicalCasePhoto } from '../types';
import CONFIG from '../config';
import CasePhotoUploader from './CasePhotoUploader';

interface ClinicalCaseCardProps {
  caseItem: ClinicalCase;
  index: number;
  totalCases: number;
  uid?: string;
  onUpdate: (updatedCase: ClinicalCase) => void;
  onDelete: (caseId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isSaving?: boolean;
}

export const ClinicalCaseCard: React.FC<ClinicalCaseCardProps> = ({
  caseItem,
  index,
  totalCases,
  uid,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isSaving = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (field: keyof ClinicalCase, value: any) => {
    onUpdate({
      ...caseItem,
      [field]: value,
    });
  };

  const handlePhotoUpdate = (role: 'before' | 'after', photoRef: ClinicalCasePhoto) => {
    if (role === 'before') {
      onUpdate({ ...caseItem, beforePhoto: photoRef });
    } else {
      onUpdate({ ...caseItem, afterPhoto: photoRef });
    }
  };

  const handlePhotoRemove = (role: 'before' | 'after') => {
    if (role === 'before') {
      onUpdate({ ...caseItem, beforePhoto: undefined });
    } else {
      onUpdate({ ...caseItem, afterPhoto: undefined });
    }
  };

  const handleAddAdditionalPhoto = (photoRef: ClinicalCasePhoto) => {
    const existing = caseItem.additionalPhotos || [];
    onUpdate({
      ...caseItem,
      additionalPhotos: [...existing, photoRef],
    });
  };

  const handleRemoveAdditionalPhoto = (photoIndex: number) => {
    const existing = caseItem.additionalPhotos || [];
    onUpdate({
      ...caseItem,
      additionalPhotos: existing.filter((_, i) => i !== photoIndex),
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-muted/30 border-b border-border select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-start font-bold text-sm text-foreground hover:text-brand transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-black">
              {index + 1}
            </span>
            <span className="truncate max-w-[180px] sm:max-w-xs">
              {caseItem.title || caseItem.titleAr || `حالة الأسنان ${index + 1}`}
            </span>
          </button>

          {caseItem.category && (
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-muted font-semibold text-muted-foreground border border-border/60">
              {CONFIG.caseCategories.find(c => c.id === caseItem.category)?.ar || caseItem.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Reordering buttons */}
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0 || isSaving}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="نقل لأعلى"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === totalCases - 1 || isSaving}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="نقل لأسفل"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          <div className="w-px h-4 bg-border mx-1" />

          {/* Delete Case */}
          <button
            type="button"
            onClick={() => onDelete(caseItem.id)}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="حذف هذه الحالة بالكامل"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5" dir="rtl">
          {/* Clinical Photos Grid (Before & After) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-brand" />
                <span>صور حالة الأسنان (قبل / بعد)</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                صور محسنة فائقة الوضوح
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <CasePhotoUploader
                uid={uid}
                caseId={caseItem.id}
                role="before"
                label="صورة قبل العلاج (Before Photo)"
                sublabel="الحالة الأولية للمريض قبل الإجراء"
                photo={caseItem.beforePhoto}
                onPhotoUploaded={(p) => handlePhotoUpdate('before', p)}
                onPhotoRemoved={() => handlePhotoRemove('before')}
                disabled={isSaving}
              />

              <CasePhotoUploader
                uid={uid}
                caseId={caseItem.id}
                role="after"
                label="صورة بعد العلاج (After Photo)"
                sublabel="النتيجة النهائية والابتسامة"
                photo={caseItem.afterPhoto}
                onPhotoUploaded={(p) => handlePhotoUpdate('after', p)}
                onPhotoRemoved={() => handlePhotoRemove('after')}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Additional Photos (Optional) */}
          <div className="border-t border-border/70 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="text-xs font-bold text-foreground">صور إضافية للحالة (اختياري)</span>
                <p className="text-[11px] text-muted-foreground">مثل صور الأشعة (X-Ray)، أو مراحل التحضير (Prep)، أو الخطوات المرحلية.</p>
              </div>
              <span className="text-xs font-semibold text-brand">
                {(caseItem.additionalPhotos || []).length} من 4
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(caseItem.additionalPhotos || []).map((photo, pIdx) => (
                <div key={photo.uploadId || pIdx} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-square">
                  <img
                    src={photo.previewUrl || photo.url}
                    alt={`Additional ${pIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalPhoto(pIdx)}
                    className="absolute top-1.5 left-1.5 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف الصورة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {(!caseItem.additionalPhotos || caseItem.additionalPhotos.length < 4) && (
                <div className="col-span-1">
                  <CasePhotoUploader
                    uid={uid}
                    caseId={caseItem.id}
                    role="additional"
                    label="+ صورة إضافية"
                    photo={undefined}
                    onPhotoUploaded={handleAddAdditionalPhoto}
                    onPhotoRemoved={() => {}}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Details Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-border/70 pt-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                {CONFIG.labels.category}
              </label>
              <select
                value={caseItem.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <option value="">{CONFIG.labels.selectCategory}</option>
                {CONFIG.caseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ar} ({c.en})
                  </option>
                ))}
                <option value="custom">{CONFIG.labels.customCategory}</option>
              </select>
            </div>

            {/* Custom Category if selected */}
            {caseItem.category === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  اسم التصنيف المخصص
                </label>
                <input
                  type="text"
                  value={caseItem.customCategory || ''}
                  onChange={(e) => handleFieldChange('customCategory', e.target.value)}
                  placeholder="مثال: علم زراعة الأسنان الفوري"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
            )}

            {/* Title AR */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                {CONFIG.labels.caseTitleAr}
              </label>
              <input
                type="text"
                value={caseItem.titleAr || ''}
                onChange={(e) => handleFieldChange('titleAr', e.target.value)}
                placeholder={CONFIG.placeholders.caseTitleAr}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>

            {/* Title EN */}
            <div dir="ltr">
              <label className="block text-xs font-bold text-foreground mb-1.5 text-right">
                {CONFIG.labels.caseTitleEn}
              </label>
              <input
                type="text"
                value={caseItem.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder={CONFIG.placeholders.caseTitleEn}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>

            {/* Treatment Type */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نوع الإجراء / العلاج المهني
              </label>
              <input
                type="text"
                value={caseItem.treatmentType || ''}
                onChange={(e) => handleFieldChange('treatmentType', e.target.value)}
                placeholder="مثال: فينير مباشر أو زراعة فورية"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>

            {/* Clinical Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1.5">
                تفاصيل ووصف حالة الأسنان
              </label>
              <textarea
                value={caseItem.descriptionAr || caseItem.description || ''}
                onChange={(e) => {
                  handleFieldChange('descriptionAr', e.target.value);
                  handleFieldChange('description', e.target.value);
                }}
                rows={2}
                placeholder="اشرح باختصار شكوى المريض، خطة العلاج، والمواد المستخدمة (مثل Komposit B1)..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalCaseCard;
