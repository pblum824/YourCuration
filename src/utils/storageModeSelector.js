// File: src/utils/storageModeSelector.js
import { setImageStorageMode } from './imageStore';

const SIZE_THRESHOLD_MB = 450;
const FALLBACK_MODE = 'zip';

export function storageModeSelector(galleryTotalSizeBytes, force = false) {
  const sizeMB = galleryTotalSizeBytes / (1024 * 1024);
  const current = getCurrentMode();
  const mode = sizeMB > SIZE_THRESHOLD_MB ? FALLBACK_MODE : 'indexeddb';

  if (force || mode !== current) {
    try {
      localStorage.setItem('yourcuration_image_strategy', mode);
    } catch (err) {
      console.warn('Could not persist image storage mode:', err);
    }
    setImageStorageMode(mode);
  }

  return mode;
}

function getCurrentMode() {
  try {
    return localStorage.getItem('yourcuration_image_strategy') || 'indexeddb';
  } catch {
    return 'indexeddb';
  }
}