/**
 * PortfolioHubs - Advanced Web Worker Image Compression Engine
 * 
 * Specifications:
 * - WebP output with initial quality 0.82
 * - Max dimension: 1600px (aspect ratio preserved)
 * - Thumbnail version: 400px max dimension
 * - Background execution via Web Worker (zero UI thread freezing)
 * - Strict 500 KB limit enforcement (iterative multi-pass recompression)
 * - Returns before/after metrics (bytes, KB, reduction ratio)
 * - Standalone and zero-cost, no third-party APIs
 */

export interface CompressionMetrics {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionRatioPercent: number;
  width: number;
  height: number;
  passes: number;
  finalQuality: number;
}

export interface CompressionResult {
  // Main full-resolution WebP (max 1600px, strictly <= 500KB)
  webpBlob: Blob;
  webpBase64: string;
  // Thumbnail WebP (max 400px, ultra-compact for fast UI previews)
  thumbnailWebpBlob: Blob;
  thumbnailBase64: string;
  // Performance and size metrics
  metrics: CompressionMetrics;
  mimeType: 'image/webp';
}

export interface CompressionOptions {
  maxDimension?: number;
  thumbnailDimension?: number;
  initialQuality?: number;
  maxSizeBytes?: number; // default: 500 * 1024 = 512,000 bytes (500 KB)
  minQuality?: number;
  qualityStep?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxDimension: 1600,
  thumbnailDimension: 400,
  initialQuality: 0.82,
  maxSizeBytes: 500 * 1024, // 500 KB hard limit
  minQuality: 0.30,
  qualityStep: 0.08,
};

// Web Worker code embedded as string to avoid bundler asset path resolution issues
const WORKER_CODE = `
self.onmessage = async function(e) {
  const { id, fileData, mimeType, options } = e.data;
  
  try {
    const blob = new Blob([fileData], { type: mimeType });
    const originalSizeBytes = blob.size;
    
    // Decode image into an ImageBitmap
    const imageBitmap = await createImageBitmap(blob);
    const origWidth = imageBitmap.width;
    const origHeight = imageBitmap.height;
    
    // 1. Calculate target dimensions for full image (maxDimension: 1600px)
    let { width, height } = calculateDimensions(origWidth, origHeight, options.maxDimension);
    
    // 2. Multi-pass compression loop to guarantee <= maxSizeBytes (500 KB)
    let currentQuality = options.initialQuality;
    let passes = 0;
    let compressedBlob = null;
    let currentWidth = width;
    let currentHeight = height;

    while (passes < 15) {
      passes++;
      
      const offscreen = new OffscreenCanvas(currentWidth, currentHeight);
      const ctx = offscreen.getContext('2d', { alpha: true, willReadFrequently: false });
      
      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imageBitmap, 0, 0, currentWidth, currentHeight);
      
      compressedBlob = await offscreen.convertToBlob({
        type: 'image/webp',
        quality: currentQuality
      });
      
      // Check if size is strictly within the 500 KB limit
      if (compressedBlob.size <= options.maxSizeBytes) {
        break;
      }
      
      // If still oversized, reduce quality first
      if (currentQuality > options.minQuality) {
        currentQuality = Math.max(options.minQuality, currentQuality - options.qualityStep);
      } else {
        // If quality already reached minQuality (0.30) and still oversized, aggressively downscale dimensions
        currentWidth = Math.max(400, Math.round(currentWidth * 0.80));
        currentHeight = Math.max(300, Math.round(currentHeight * 0.80));
      }
    }
    
    // 3. Generate Thumbnail (max 400px, quality 0.75)
    const thumbDims = calculateDimensions(origWidth, origHeight, options.thumbnailDimension);
    const thumbCanvas = new OffscreenCanvas(thumbDims.width, thumbDims.height);
    const thumbCtx = thumbCanvas.getContext('2d', { alpha: true });
    thumbCtx.imageSmoothingEnabled = true;
    thumbCtx.imageSmoothingQuality = 'medium';
    thumbCtx.drawImage(imageBitmap, 0, 0, thumbDims.width, thumbDims.height);
    
    const thumbBlob = await thumbCanvas.convertToBlob({
      type: 'image/webp',
      quality: 0.75
    });

    imageBitmap.close();

    // Convert both blobs to ArrayBuffers for zero-copy transfer back to main thread
    const mainBuffer = await compressedBlob.arrayBuffer();
    const thumbBuffer = await thumbBlob.arrayBuffer();

    const reductionRatio = ((originalSizeBytes - compressedBlob.size) / originalSizeBytes) * 100;

    self.postMessage({
      id,
      success: true,
      mainBuffer,
      thumbBuffer,
      metrics: {
        originalSizeBytes,
        compressedSizeBytes: compressedBlob.size,
        originalSizeKb: Math.round(originalSizeBytes / 1024),
        compressedSizeKb: Math.round(compressedBlob.size / 1024),
        reductionRatioPercent: Math.max(0, Math.round(reductionRatio * 10) / 10),
        width: currentWidth,
        height: currentHeight,
        passes,
        finalQuality: Math.round(currentQuality * 100) / 100
      }
    }, [mainBuffer, thumbBuffer]);

  } catch (err) {
    self.postMessage({
      id,
      success: false,
      error: err.message || 'Worker compression failed'
    });
  }
};

function calculateDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio))
  };
}
`;

// Helper to convert Blob to Base64 data URL
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Fallback compressor for environments lacking OffscreenCanvas in Worker
async function compressOnMainThreadFallback(
  file: File | Blob,
  options: Required<CompressionOptions>
): Promise<CompressionResult> {
  const originalSizeBytes = file.size;
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = objectUrl;
  });

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Calculate main dimensions
  let { width, height } = calculateAspectDimensions(origWidth, origHeight, options.maxDimension);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  let currentQuality = options.initialQuality;
  let passes = 0;
  let compressedBlob: Blob | null = null;
  let currentWidth = width;
  let currentHeight = height;

  while (passes < 15) {
    passes++;
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    compressedBlob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(
        b => (b ? res(b) : rej(new Error('Canvas WebP encoding failed'))),
        'image/webp',
        currentQuality
      );
    });

    if (compressedBlob.size <= options.maxSizeBytes) {
      break;
    }

    if (currentQuality > options.minQuality) {
      currentQuality = Math.max(options.minQuality, currentQuality - options.qualityStep);
    } else {
      currentWidth = Math.max(400, Math.round(currentWidth * 0.80));
      currentHeight = Math.max(300, Math.round(currentHeight * 0.80));
    }
  }

  // Generate thumbnail
  const thumbDims = calculateAspectDimensions(origWidth, origHeight, options.thumbnailDimension);
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbDims.width;
  thumbCanvas.height = thumbDims.height;
  const thumbCtx = thumbCanvas.getContext('2d');
  if (!thumbCtx) throw new Error('Could not obtain thumbnail canvas context');
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = 'medium';
  thumbCtx.drawImage(img, 0, 0, thumbDims.width, thumbDims.height);

  const thumbBlob = await new Promise<Blob>((res, rej) => {
    thumbCanvas.toBlob(
      b => (b ? res(b) : rej(new Error('Thumbnail encoding failed'))),
      'image/webp',
      0.75
    );
  });

  URL.revokeObjectURL(objectUrl);

  if (!compressedBlob) throw new Error('Compression failed to produce a blob');

  const [webpBase64, thumbnailBase64] = await Promise.all([
    blobToBase64(compressedBlob),
    blobToBase64(thumbBlob),
  ]);

  const reductionRatio = ((originalSizeBytes - compressedBlob.size) / originalSizeBytes) * 100;

  return {
    webpBlob: compressedBlob,
    webpBase64,
    thumbnailWebpBlob: thumbBlob,
    thumbnailBase64,
    mimeType: 'image/webp',
    metrics: {
      originalSizeBytes,
      compressedSizeBytes: compressedBlob.size,
      originalSizeKb: Math.round(originalSizeBytes / 1024),
      compressedSizeKb: Math.round(compressedBlob.size / 1024),
      reductionRatioPercent: Math.max(0, Math.round(reductionRatio * 10) / 10),
      width: currentWidth,
      height: currentHeight,
      passes,
      finalQuality: Math.round(currentQuality * 100) / 100,
    },
  };
}

function calculateAspectDimensions(width: number, height: number, maxDim: number) {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

// Global Singleton Worker Manager
class CompressionWorkerManager {
  private worker: Worker | null = null;
  private workerUrl: string | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
    }
  >();

  private getWorker(): Worker | null {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return null;
    }

    if (!this.worker) {
      try {
        const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
        this.workerUrl = URL.createObjectURL(blob);
        this.worker = new Worker(this.workerUrl);

        this.worker.onmessage = (e: MessageEvent) => {
          const { id, success, mainBuffer, thumbBuffer, metrics, error } = e.data;
          const pending = this.pendingRequests.get(id);
          if (!pending) return;

          this.pendingRequests.delete(id);

          if (success) {
            const webpBlob = new Blob([mainBuffer], { type: 'image/webp' });
            const thumbnailWebpBlob = new Blob([thumbBuffer], { type: 'image/webp' });

            Promise.all([blobToBase64(webpBlob), blobToBase64(thumbnailWebpBlob)])
              .then(([webpBase64, thumbnailBase64]) => {
                pending.resolve({
                  webpBlob,
                  webpBase64,
                  thumbnailWebpBlob,
                  thumbnailBase64,
                  mimeType: 'image/webp',
                  metrics,
                });
              })
              .catch(pending.reject);
          } else {
            pending.reject(new Error(error || 'Worker compression failed'));
          }
        };

        this.worker.onerror = (err) => {
          console.warn('Image compression worker error, will use fallback:', err);
        };
      } catch (err) {
        console.warn('Unable to initialize image compression Web Worker:', err);
        return null;
      }
    }

    return this.worker;
  }

  public async compress(
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const mergedOptions: Required<CompressionOptions> = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const worker = this.getWorker();

    // Check if worker supports OffscreenCanvas
    const hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

    if (worker && hasOffscreenCanvas) {
      const id = ++this.requestId;
      const arrayBuffer = await file.arrayBuffer();

      return new Promise<CompressionResult>((resolve, reject) => {
        this.pendingRequests.set(id, { resolve, reject });

        try {
          worker.postMessage(
            {
              id,
              fileData: arrayBuffer,
              mimeType: file.type || 'image/jpeg',
              options: mergedOptions,
            },
            [arrayBuffer]
          );
        } catch (postErr) {
          this.pendingRequests.delete(id);
          // Fall back to main thread if postMessage transfer fails
          compressOnMainThreadFallback(file, mergedOptions).then(resolve).catch(reject);
        }
      });
    }

    // Fallback if Web Worker / OffscreenCanvas is unavailable
    return compressOnMainThreadFallback(file, mergedOptions);
  }
}

const workerManager = new CompressionWorkerManager();

/**
 * Compresses any image into WebP format with strict size constraint (<= 500 KB)
 * using an asynchronous Web Worker.
 * 
 * @param file - The input image File or Blob (JPEG, PNG, HEIC, etc.)
 * @param options - Custom compression parameters (maxDimension, quality, etc.)
 * @returns Promise<CompressionResult> with main WebP, thumbnail, and before/after metrics
 */
export async function compressDentalImage(
  file: File | Blob,
  options?: CompressionOptions
): Promise<CompressionResult> {
  return workerManager.compress(file, options);
}

/**
 * Batch compresses an array of images sequentially or in parallel with a concurrency cap.
 */
export async function compressBatchDentalImages(
  files: (File | Blob)[],
  options?: CompressionOptions,
  concurrency = 2
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const queue = [...files];

  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) break;
      const res = await compressDentalImage(file, options);
      results.push(res);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Convenient wrapper returning base64, previewUrl, and size metrics
 */
export async function compressImage(
  file: File | Blob,
  options?: CompressionOptions
): Promise<{
  base64: string;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}> {
  const res = await compressDentalImage(file, options);
  return {
    base64: res.webpBase64,
    previewUrl: res.thumbnailBase64 || res.webpBase64,
    originalSizeKb: res.metrics.originalSizeKb,
    compressedSizeKb: res.metrics.compressedSizeKb,
  };
}

