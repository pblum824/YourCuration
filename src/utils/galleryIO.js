// File: src/utils/galleryIO.js

import { imageToBase64, toUrl } from './imageHelpers';
import { saveImage, loadImage, setImageStorageMode, getImageStorageMode } from './imageStore';
import { useCuration } from '../YourCurationContext';

// EXPORT FUNCTION
export const exportGalleryData = async ({ heroImage, borderSkin, centerBackground, artistGallery }) => {
  const strategy = getImageStorageMode();

  const exportImage = async (img) => {
    if (!img) return null;

    let base64 = null;
    if (strategy === 'indexeddb') {
      base64 = img.base64 || (await imageToBase64(img.url));
    }

    return {
      id: img.id,
      name: img.name,
      localRefId: img.localRefId,
      data: base64, // Only embedded for indexeddb
      scrapeEligible: img.scrapeEligible,
      galleryEligible: img.galleryEligible,
      sampleEligible: img.sampleEligible,
      metadata: img.metadata || {},
    };
  };

  const bundle = {
    timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
    strategy,
    heroImage: await exportImage(heroImage),
    borderSkin: await exportImage(borderSkin),
    centerBackground: await exportImage(centerBackground),
    images: await Promise.all(artistGallery.map(exportImage)),
  };

  return new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json',
  });
};

// IMPORT FUNCTION
export const importGalleryData = async (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const bundle = JSON.parse(reader.result);

        // Apply storage strategy if present
        if (bundle.strategy) {
          setImageStorageMode(bundle.strategy);
        }

        const restoreImage = async (img) => {
          if (!img || !img.data) return null;

          const hydrated = await toUrl(
            img.data,
            img.name,
            img.metadata,
            img.scrapeEligible,
            img.galleryEligible,
            img.sampleEligible
          );

          await saveImage(hydrated.id, await fetch(hydrated.url).then((r) => r.blob()));

          return { ...hydrated, localRefId: hydrated.id };
        };

        const heroImage = await restoreImage(bundle.heroImage);
        const borderSkin = await restoreImage(bundle.borderSkin);
        const centerBackground = await restoreImage(bundle.centerBackground);
        const images = (await Promise.all((bundle.images || []).map(restoreImage))).filter(Boolean);

        resolve({
          heroImage,
          borderSkin,
          centerBackground,
          images,
          selectedFont: bundle.selectedFont,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};