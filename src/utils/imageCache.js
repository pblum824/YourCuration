// File: utils/imageCache.js

/**
 * Store compressed image data in localStorage by ID
 * @param {string} id - Unique ID for the image
 * @param {Blob} blob - Compressed image blob
 */
export async function storeImage(id, blob) {
  const base64 = await blobToBase64(blob);
  try {
    localStorage.setItem(`img:${id}`, base64);
  } catch (err) {
    console.warn('Storage failed for image', id, err);
  }
}

/**
 * Retrieve compressed image as Blob from localStorage
 * @param {string} id - Unique ID used for storage
 * @returns {Blob|null}
 */
export function loadImageBlob(id) {
  const base64 = localStorage.getItem(`img:${id}`);
  if (!base64) return null;
  return base64ToBlob(base64);
}

/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to convert blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64) {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}