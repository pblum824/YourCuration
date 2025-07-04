// File: src/utils/imageStore.js

import { saveBlob, loadBlob, clearBlobs, listBlobKeys } from './dbCache';
import * as zipStore from './zipStore';
import * as fsStore from './fsStore';

let strategy = 'indexeddb';

export function setImageStorageMode(mode) {
  if (!['indexeddb', 'zip', 'filesystem'].includes(mode)) {
    throw new Error(`Unsupported image storage mode: ${mode}`);
  }
  strategy = mode;
}

export function getImageStorageMode() {
  return strategy;
}

export async function saveImage(id, blob) {
  switch (strategy) {
    case 'indexeddb':
      return saveBlob(id, blob);
    case 'filesystem':
      return fsStore.saveImageToFS(id, blob);
    case 'zip':
      return zipStore.cacheImageToZip(id, blob);
    default:
      throw new Error(`Unsupported saveImage strategy: ${strategy}`);
  }
}

export async function loadImage(id) {
  switch (strategy) {
    case 'indexeddb':
      return loadBlob(id);
    case 'filesystem':
      return fsStore.loadImageFromFS(id);
    case 'zip':
      return zipStore.loadImageFromZip(id);
    default:
      throw new Error(`Unsupported loadImage strategy: ${strategy}`);
  }
}

export async function deleteImage(id) {
  switch (strategy) {
    case 'indexeddb':
      return clearBlobs(id);
    case 'filesystem':
      return fsStore.deleteImageFromFS(id);
    case 'zip':
      return zipStore.deleteImageFromZip(id);
    default:
      throw new Error(`Unsupported deleteImage strategy: ${strategy}`);
  }
}

export async function listImageKeys() {
  switch (strategy) {
    case 'indexeddb':
      return listBlobKeys();
    case 'filesystem':
      return fsStore.listImageKeysFromFS();
    case 'zip':
      return zipStore.listZipKeys();
    default:
      throw new Error(`Unsupported listImageKeys strategy: ${strategy}`);
  }
}