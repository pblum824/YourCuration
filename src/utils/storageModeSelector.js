// File: src/utils/storageModeSelector.js

import { setImageStorageMode } from './imageStore';

const IMAGE_LIMIT = 500;

/**
 * Selects and sets an image storage strategy based on gallery size.
 * Defaults to 'indexeddb' but escalates to 'filesystem' when needed.
 * @param {number} totalImages - Number of images uploaded or present.
 * @returns {string} selected strategy
 */
export function storageModeSelector(totalImages) {
  const mode = totalImages > IMAGE_LIMIT ? 'filesystem' : 'indexeddb';
  setImageStorageMode(mode);
  return mode;
}