// File: src/utils/zipStore.js
const imageCache = new Map();

export async function cacheImageToZip(id, blob) {
  imageCache.set(id, blob);
  return id; // ✅ explicitly return the ID used
}

export async function loadImageFromZip(id) {
  return imageCache.get(id) || null;
}

export async function deleteImageFromZip(id) {
  imageCache.delete(id);
}

export async function listZipKeys() {
  return Array.from(imageCache.keys());
}