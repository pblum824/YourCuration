// utils/generateSafeFilename.js

export function sanitizeFilename(filename) {
  const base = filename.substring(0, filename.lastIndexOf('.')) || filename;
  const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';
  const cleanBase = base.replace(/[^a-z0-9-_]/gi, '_');
  return cleanBase + ext;
}

export function generateTimestampedFilename(filename) {
  const base = filename.substring(0, filename.lastIndexOf('.')) || filename;
  const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';
  const cleanBase = base.replace(/[^a-z0-9-_]/gi, '_');
  const now = Date.now();
  return `${cleanBase}_${now}${ext}`;
}

// Usage Example:
// import { generateTimestampedFilename } from './utils/generateSafeFilename';
// const safeName = generateTimestampedFilename(file.name);
