import { auth } from './firebase';
import { dataUrlToBlob } from './imageProcessor';

const workerBaseUrl = import.meta.env.VITE_API_BASE_URL ||
  'https://portfoliohubs-api.portfoliohubs-contact.workers.dev';
interface ImageKitUploadResponse {
  fileId: string;
  url: string;
  filePath: string;
  thumbnailUrl?: string;
}

export async function uploadImageToImageKit(
  uid: string,
  relativePath: string,
  dataUrl: string,
  metadata: Record<string, unknown> = {},
): Promise<{ url: string; isFallback: boolean }> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return { url: dataUrl, isFallback: false };
  }

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('You must be signed in to upload website media.');
  }

  const idToken = await auth.currentUser.getIdToken(true);
  const blob = dataUrlToBlob(dataUrl);
  const form = new FormData();
  form.append('file', blob, relativePath.split('/').pop() || 'website-image.webp');
  form.append('fileName', relativePath.split('/').pop() || 'website-image.webp');
  form.append('folder', `/portfoliohubs/${uid}/${relativePath.split('/').slice(0, -1).join('/')}`);
  let uploadResponse = await fetch(`${workerBaseUrl}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  });
  if (uploadResponse.status === 401 && auth.currentUser) {
    const refreshedToken = await auth.currentUser.getIdToken(true);
    uploadResponse = await fetch(`${workerBaseUrl}/api/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshedToken}` },
      body: form,
    });
  }
  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text();
    throw new Error(`ImageKit rejected the media upload (${uploadResponse.status}): ${detail}`);
  }

  const uploaded = await uploadResponse.json() as ImageKitUploadResponse;
  let completeResponse = await fetch(`${workerBaseUrl}/api/media/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileId: uploaded.fileId,
      url: uploaded.url,
      filePath: uploaded.filePath,
      thumbnailUrl: uploaded.thumbnailUrl,
      mimeType: blob.type,
      size: blob.size,
      ...metadata,
    }),
  });
  if (completeResponse.status === 401 && auth.currentUser) {
    const refreshedToken = await auth.currentUser.getIdToken(true);
    completeResponse = await fetch(`${workerBaseUrl}/api/media/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshedToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: uploaded.fileId,
        url: uploaded.url,
        filePath: uploaded.filePath,
        thumbnailUrl: uploaded.thumbnailUrl,
        mimeType: blob.type,
        size: blob.size,
        ...metadata,
      }),
    });
  }
  if (!completeResponse.ok) {
    const detail = await completeResponse.text();
    throw new Error(`Media uploaded but metadata could not be saved (${completeResponse.status}): ${detail}`);
  }

  return { url: uploaded.url, isFallback: false };
}
