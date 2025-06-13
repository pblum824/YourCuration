// File: src/CuratedGalleryFinal.jsx
import React from 'react';
import { useCuration } from './YourCurationContext';
import { saveBlob } from './utils/dbCache';

export default function CuratedGalleryFinal({ setView }) {
  const { artistGallery, mode } = useCuration();

  const exportGallery = async () => {
    const images = await Promise.all(
      artistGallery.map(async (img) => {
        const blob = await loadImageBlob(img.localRefId);
        const base64 = await blobToBase64(blob);
        return {
          name: img.name,
          data: base64,
          scrapeEligible: img.scrapeEligible,
          galleryEligible: img.galleryEligible,
          sampleEligible: img.sampleEligible,
          metadata: img.metadata || {},
        };
      })
    );

    const bundle = {
      timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
      images,
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
      {mode === 'artist' && setView && (
        <button
          onClick={() => setView('artist')}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#1e3a8a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          Exit Client Presentation
        </button>
      )}

      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Curated Gallery Final
      </h2>
      <button
        onClick={exportGallery}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          backgroundColor: '#f0fdfa',
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