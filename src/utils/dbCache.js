// File: utils/dbCache.js

const DB_NAME = 'yourcuration-images';
const STORE_NAME = 'blobs';
const VERSION = 1;

function screenLog(msg) {
  let div = document.getElementById('storage-logger');
  if (!div) {
    div = document.createElement('div');
    div.id = 'storage-logger';
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.maxHeight = '200px';
    div.style.overflowY = 'auto';
    div.style.backgroundColor = '#fef3c7';
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '0.85rem';
    div.style.borderTop = '1px solid #facc15';
    div.style.padding = '0.25rem 1rem';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
  }
  const line = document.createElement('div');
  line.textContent = `💾 ${msg}`;
  div.appendChild(line);
}

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onerror = () => {
      screenLog('❌ getDB error');
      reject(request.error);
    };
    request.onsuccess = () => {
      screenLog('✅ DB opened successfully');
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        screenLog('📁 Object store created');
      }
    };
  });
}

export async function saveBlob(id, blob) {
  screenLog(`📥 saveBlob(${id})`);
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(blob, id);
    tx.oncomplete = () => {
      screenLog(`✅ Blob saved: ${id}`);
      resolve();
    };
    tx.onerror = () => {
      screenLog(`❌ Failed to save blob: ${id}`);
      reject(tx.error);
    };
  });
}

export async function loadBlob(id) {
  screenLog(`📤 loadBlob(${id})`);
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      screenLog(`📦 Loaded blob: ${id}`);
      resolve(req.result || null);
    };
    req.onerror = () => {
      screenLog(`❌ Error loading blob: ${id}`);
      reject(req.error);
    };
  });
}

export async function listBlobKeys() {
  const db = await getDB();
  screenLog('📋 listBlobKeys');
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      screenLog(`✅ Keys found: ${req.result.length}`);
      resolve(req.result);
    };
    req.onerror = () => {
      screenLog('❌ listBlobKeys error');
      reject(req.error);
    };
  });
}

export async function clearBlobs() {
  const db = await getDB();
  screenLog('🗑️ clearBlobs');
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => {
      screenLog('✅ Blobs cleared');
      resolve();
    };
    tx.onerror = () => {
      screenLog('❌ Failed to clear blobs');
      reject(tx.error);
    };
  });
}