// File: src/utils/storageStrategyGate.js

import { setImageStorageMode } from './imageStore';

const IMAGE_LIMIT = 500; // Artist uploads over this get redirected

export function storageModeSelector({ totalImages }) {
  if (totalImages > IMAGE_LIMIT) {
    setImageStorageMode('filesystem');
    return 'filesystem';
  }

  setImageStorageMode('indexeddb');
  return 'indexeddb';
}