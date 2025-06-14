// File: utils/galleryIO.js
import { imageToBase64, toUrl } from './imageHelpers';

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

export const importGalleryData = async (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const bundle = JSON.parse(reader.result);

        const heroImage = bundle.heroImage
          ? await toUrl(
              bundle.heroImage.data,
              bundle.heroImage.name,
              bundle.heroImage.metadata,
              bundle.heroImage.scrapeEligible,
              bundle.heroImage.galleryEligible,
              bundle.heroImage.sampleEligible
            )
          : null;

        const borderSkin = bundle.borderSkin
          ? await toUrl(
              bundle.borderSkin.data,
              bundle.borderSkin.name,
              bundle.borderSkin.metadata,
              bundle.borderSkin.scrapeEligible,
              bundle.borderSkin.galleryEligible,
              bundle.borderSkin.sampleEligible
            )
          : null;

        const centerBackground = bundle.centerBackground
          ? await toUrl(
              bundle.centerBackground.data,
              bundle.centerBackground.name,
              bundle.centerBackground.metadata,
              bundle.centerBackground.scrapeEligible,
              bundle.centerBackground.galleryEligible,
              bundle.centerBackground.sampleEligible
            )
          : null;

        const images = Array.isArray(bundle.images)
          ? await Promise.all(
              bundle.images.map((img) =>
                toUrl(
                  img.data,
                  img.name,
                  img.metadata,
                  img.scrapeEligible,
                  img.galleryEligible,
                  img.sampleEligible
                )
              )
            )
          : [];
        logToScreen(`🧠 Imported ${images.length} image(s) from bundle`);
        logToScreen(`📦 First image: ${images[0]?.name || 'none'}`);
        resolve({ heroImage, borderSkin, centerBackground, images });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};