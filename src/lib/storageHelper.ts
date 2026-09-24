import { uploadImageToImageKit } from './imagekitService';

export interface UploadProgress {
  step: string;
  percent: number;
}

/**
 * Website media uploader backed by ImageKit and authorized by the Cloudflare Worker.
 */
export async function uploadImageResilient(
  uid: string,
  relativePath: string,
  dataUrl: string,
  timeoutMs = 60000
): Promise<{ url: string; isFallback: boolean }> {
  // If already a remote URL, return immediately
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return { url: dataUrl, isFallback: false };
  }

  try {
    return await Promise.race([
      uploadImageToImageKit(uid, relativePath, dataUrl),
      new Promise<never>((_, reject) => setTimeout(
        () => reject(new Error(`ImageKit upload timed out after ${timeoutMs}ms`)),
        timeoutMs,
      )),
    ]);
  } catch (error: any) {
    const reason = error?.message || 'unknown storage error';
    console.error(
      `[StorageHelper] ImageKit upload for "${relativePath}" could not complete: ${reason}`,
    );
    throw new Error(`Image upload failed for "${relativePath}": ${reason}`);
  }
}

/**
 * Parallel batch uploader for clinical cases and profile assets
 */
export async function uploadBatchResilient(
  uid: string,
  items: Array<{ key: string; dataUrl: string; path: string }>,
  onProgress?: (progress: UploadProgress) => void
): Promise<Record<string, string>> {
  const total = items.length;
  if (total === 0) return {};

  const results: Record<string, string> = {};
  let completed = 0;

  const promises = items.map(async (item) => {
    if (!item.dataUrl || !item.dataUrl.startsWith('data:image')) {
      results[item.key] = item.dataUrl;
      completed++;
      onProgress?.({
        step: `Ready (${completed}/${total})`,
        percent: Math.round((completed / total) * 100),
      });
      return;
    }

    onProgress?.({
      step: `Saving photo (${completed + 1}/${total})...`,
      percent: Math.round((completed / total) * 100),
    });

    const res = await uploadImageResilient(uid, item.path, item.dataUrl);
    results[item.key] = res.url;
    completed++;

    onProgress?.({
      step: `Completed (${completed}/${total})`,
      percent: Math.round((completed / total) * 100),
    });
  });

  await Promise.all(promises);
  return results;
}
