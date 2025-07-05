// File: src/utils/fsStore.js

let fileHandleMap = new Map();
let rootDir = null;

export async function chooseFSDirectory() {
  try {
    rootDir = await window.showDirectoryPicker();
    console.log('[FS] Directory selected:', rootDir);
  } catch (err) {
    console.warn('[FS] Directory selection failed:', err);
    rootDir = null;
  }
}

function getFileHandle(id) {
  return fileHandleMap.get(id);
}

export async function saveImageToFS(id, blob) {
  if (!rootDir) throw new Error('No root directory selected');
  const handle = await rootDir.getFileHandle(`${id}.jpg`, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  fileHandleMap.set(id, handle);
  console.log('[FS] Saved', id);
}

export async function loadImageFromFS(id) {
  if (!rootDir) throw new Error('No root directory selected');
  const handle = getFileHandle(id) || await rootDir.getFileHandle(`${id}.jpg`);
  const file = await handle.getFile();
  console.log('[FS] Loaded', id);
  return file;
}

export async function deleteImageFromFS(id) {
  if (!rootDir) return;
  try {
    await rootDir.removeEntry(`${id}.jpg`);
    fileHandleMap.delete(id);
    console.log('[FS] Deleted', id);
  } catch (e) {
    console.warn('[FS] Delete failed for', id);
  }
}

export async function listImageKeysFromFS() {
  if (!rootDir) return [];
  const keys = [];
  for await (const entry of rootDir.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.jpg')) {
      const id = entry.name.replace('.jpg', '');
      keys.push(id);
    }
  }
  return keys;
}