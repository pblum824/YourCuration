// File: src/utils/storageModeSelector.js
import { setImageStorageMode } from './imageStore';

const SIZE_THRESHOLD_MB = 450;
const FALLBACK_MODE = 'zip';

/**
 * Accepts current total size in bytes and returns the appropriate storage strategy.
 */
export function storageModeSelector(galleryTotalSize, force = false) {
  const sizeMB = galleryTotalSize / (1024 * 1024);
  const mode = sizeMB > SIZE_THRESHOLD_MB ? FALLBACK_MODE : 'indexeddb';

  if (force || mode !== getCurrentMode()) {
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