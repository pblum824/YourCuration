import React from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';

export default function CuratedGalleryFinal() {
  const { artistGallery, galleryRatings } = useCuration();

  const exportGallery = async () => {
    const loves = artistGallery.filter((img) => galleryRatings[img.id] === 2);
    const likes = artistGallery.filter((img) => galleryRatings[img.id] === 1);
    const finalGallery = [...loves, ...likes].slice(0, 20);

    const images = await Promise.all(
      finalGallery.map(async (img) => {
        try {
          const blob = await loadBlob(img.localRefId);
          const base64 = await blobToBase64(blob);
          return {
            name: img.name,
            data: base64,
            scrapeEligible: img.scrapeEligible,
            galleryEligible: img.galleryEligible,
            sampleEligible: img.sampleEligible,
            metadata: img.metadata || {},
          };
        } catch (err) {
          return null;
        }
      })
    );

    const bundle = {
      timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
      images: images.filter(Boolean),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `YourCuration-Gallery-${bundle.timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Curated Gallery Final
      </h2>
      <button
        onClick={exportGallery}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.25rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          backgroundColor: '#e0f2fe',
          color: '#1e3a8a',
          cursor: 'pointer',
        }}
      >
        Export Final Gallery
      </button>
    </div>
  );
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to convert blob'));
    reader.readAsDataURL(blob);
  });
}