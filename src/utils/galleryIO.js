// File: src/utils/galleryIO.js
import { imageToBase64, toUrl } from './imageHelpers';

// EXPORT FUNCTION — unchanged
export const exportGalleryData = async ({ heroImage, borderSkin, centerBackground, artistGallery }) => {
  const exportImage = async (img) => ({
    name: img.name,
    data: img.base64 || await imageToBase64(img.url),
    scrapeEligible: img.scrapeEligible,
    galleryEligible: img.galleryEligible,
    sampleEligible: img.sampleEligible,
    metadata: img.metadata || {},
  });

  const bundle = {
    timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
    heroImage: heroImage ? await exportImage(heroImage) : null,
    borderSkin: borderSkin ? await exportImage(borderSkin) : null,
    centerBackground: centerBackground ? await exportImage(centerBackground) : null,
    images: await Promise.all(artistGallery.map(exportImage)),
  };

  return new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json',
  });
};

// HELPER — convert data URL to Blob safely (iPad/Netlify-safe)
function dataURLtoBlob(dataURL) {
  const [header, base64] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

// TEXT LOGGER — prints to screen, fallback if logToScreen() unavailable
function screenLog(msg) {
  const existing = document.getElementById('import-logger');
  const el = document.createElement('div');
  el.textContent = `📥 ${msg}`;
  el.style.fontFamily = 'monospace';
  el.style.fontSize = '0.85rem';
  el.style.color = '#333';
  if (existing) existing.appendChild(el);
  else console.log(msg);
}

// IMPORT FUNCTION — now uses safe blob parsing
export const importGalleryData = async (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const bundle = JSON.parse(reader.result);

        const restoreImage = async (img) => {
          if (!img || !img.data) return null;
          try {
            const blob = dataURLtoBlob(img.data);
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const url = URL.createObjectURL(blob);
            const saved = await import('./dbCache').then(m => m.saveBlob(id, blob));
            return {
              id,
              name: img.name,
              url,
              localRefId: id,
              scrapeEligible: img.scrapeEligible,
              galleryEligible: img.galleryEligible,
              sampleEligible: img.sampleEligible,
              metadata: img.metadata || {},
            };
          } catch {
            return null;
          }
        };

        const heroImage = await restoreImage(bundle.heroImage);
        const borderSkin = await restoreImage(bundle.borderSkin);
        const centerBackground = await restoreImage(bundle.centerBackground);
        const images = await Promise.all((bundle.images || []).map(restoreImage));

        screenLog(`Imported ${images.filter(Boolean).length} image(s)`);
        if (images[0]) screenLog(`First: ${images[0].name}`);

        resolve({ heroImage, borderSkin, centerBackground, images });
      } catch (err) {
        screenLog(`❌ Import failed: ${err.message}`);
        reject(err);
      }
    };

    reader.onerror = () => {
      screenLog(`❌ Read error: ${reader.error?.message || 'unknown error'}`);
      reject(reader.error);
    };

    reader.readAsText(file);
  });
};