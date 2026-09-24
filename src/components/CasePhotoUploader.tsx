import React, { useState, useRef } from 'react';
import { 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileCheck, 
  Sparkles 
} from 'lucide-react';
import { ClinicalCasePhoto } from '../types';
import { stageCasePhotoUpload, UploadProgressReport } from '../lib/caseUploadService';

interface CasePhotoUploaderProps {
  uid?: string;
  caseId: string;
  role: 'before' | 'after' | 'additional';
  label: string;
  sublabel?: string;
  photo?: ClinicalCasePhoto;
  onPhotoUploaded: (photo: ClinicalCasePhoto) => void;
  onPhotoRemoved: () => void;
  disabled?: boolean;
}

export const CasePhotoUploader: React.FC<CasePhotoUploaderProps> = ({
  uid,
  caseId,
  role,
  label,
  sublabel,
  photo,
  onPhotoUploaded,
  onPhotoRemoved,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<UploadProgressReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const startUpload = async (file: File) => {
    if (!uid) {
      alert('يجب تسجيل الدخول أولاً لرفع الصور وحفظها في المنصة.');
      return;
    }

    setLastFile(file);
    setIsUploading(true);
    setProgress({
      stage: 'compressing',
      step: 'جارٍ تهيئة الصورة وحفظها بأعلى جودة...',
      percent: 20,
    });

    try {
      const { photoRef } = await stageCasePhotoUpload(
        uid,
        caseId,
        role,
        file,
        (report) => {
          setProgress(report);
        }
      );

      onPhotoUploaded(photoRef);
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setIsUploading(false);
      // Keep error state visible so doctor can retry
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload(file);
    }
    // Reset input so re-selecting same file triggers change
    if (e.target) e.target.value = '';
  };

  const handleRetry = () => {
    if (lastFile) {
      startUpload(lastFile);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-brand/40">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-foreground">{label}</span>
          {sublabel && (
            <span className="block text-[11px] text-muted-foreground">{sublabel}</span>
          )}
        </div>

        {photo && !isUploading && (
          <button
            type="button"
            onClick={onPhotoRemoved}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title="حذف الصورة"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>إزالة</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* When Photo is present */}
      {photo && !isUploading && (
        <div className="space-y-2">
          <div className="relative group overflow-hidden rounded-lg border border-border bg-muted/30 aspect-4/3 flex items-center justify-center">
            <img
              src={photo.previewUrl || photo.url}
              alt={label}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-card/90 text-foreground text-xs font-bold shadow hover:bg-card transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                <span>تغيير</span>
              </button>
            </div>
          </div>

          {/* Size Comparison Badge */}
          {photo.originalSizeKb && photo.compressedSizeKb && (
            <div className="flex items-center justify-between bg-muted/40 rounded-lg p-2 text-[11px] border border-border/60">
              <div className="flex items-center gap-1 text-muted-foreground">
                <FileCheck className="h-3.5 w-3.5 text-brand" />
                <span>قبل: <strong className="text-foreground">{photo.originalSizeKb} KB</strong></span>
                <span className="text-border">|</span>
                <span>بعد: <strong className="text-brand">{photo.compressedSizeKb} KB</strong></span>
              </div>
              <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded text-[10px]">
                <Sparkles className="h-2.5 w-2.5" />
                وفرت {photo.reductionRatioPercent || Math.round(((photo.originalSizeKb - photo.compressedSizeKb) / photo.originalSizeKb) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty Upload State */}
      {!photo && !isUploading && progress?.stage !== 'failed' && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="group relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 text-center hover:border-brand hover:bg-brand/5 transition-all aspect-4/3"
        >
          <div className="h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Upload className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">اختر صورة</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, HEIC (تحسين تلقائي فائق السرعة)</span>
        </button>
      )}

      {/* Progress Bar State */}
      {isUploading && progress && (
        <div className="p-4 rounded-lg border border-brand/30 bg-brand/5 space-y-2 aspect-4/3 flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-bold text-brand">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {progress.step}
            </span>
            <span>{progress.percent}%</span>
          </div>

          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          {progress.result && (
            <p className="text-[10px] text-muted-foreground text-center">
              الحجم الأصلي: {progress.result.metrics.originalSizeKb} KB &rarr; المضغوط: {progress.result.metrics.compressedSizeKb} KB
            </p>
          )}
        </div>
      )}

      {/* Error & Retry State */}
      {progress?.stage === 'failed' && (
        <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 space-y-2">
          <div className="flex items-start gap-2 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{progress.error || 'فشلت معالجة الصورة'}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-1.5 px-3 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>إعادة المحاولة الآن</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CasePhotoUploader;
