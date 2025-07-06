// File: src/utils/imageFormatHandlers.js

export function isIOSSafari() {
  return (
    /iP(hone|od|ad)/.test(navigator.userAgent) &&
    !!navigator.userAgent.match(/Safari/) &&
    !navigator.userAgent.match(/CriOS|FxiOS/)
  );
}

export async function convertHeicToJpeg(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('HEIC to JPEG conversion failed'));
          const jpegFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
          });
          resolve(jpegFile);
        }, 'image/jpeg');
      };
      img.onerror = () => reject(new Error('Failed to load HEIC image'));
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function autoConvertToSupportedFormat(file, logToScreen) {
  const ext = file.name.toLowerCase();
  if (ext.endsWith('.heic')) {
    if (isIOSSafari()) {
      logToScreen?.(`🔁 Converting HEIC → JPEG for ${file.name}`);
      try {
        return await convertHeicToJpeg(file);
      } catch (err) {
        logToScreen?.(`❌ Conversion failed for ${file.name}: ${err.message}`);
        return null;
      }
    } else {
      logToScreen?.(`❌ Cannot convert HEIC outside Safari. Skipped: ${file.name}`);
      return null;
    }
  }

  // Future stubs for RAW, TIFF, etc.
  // if (ext.endsWith('.cr3') || file.type === 'image/x-canon-cr3') {
  //   ...
  // }

  return file; // already supported
}