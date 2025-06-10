// File: src/CuratedGalleryFinal.jsx
import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import FullscreenImageViewer from './FullscreenImageViewer';

export default function CuratedGalleryFinal() {
  const { artistGallery } = useCuration();
  const [activeImage, setActiveImage] = useState(null);

  const exportGallery = async () => {
    const images = await Promise.all(
      artistGallery.map(async (img) => {
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
      {!activeImage && (
        <>
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
              marginTop: '1rem'
            }}
          >
            Export Final Gallery
          </button>
        </>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        {artistGallery.slice(0, 40).map((img) => (
          <div
            key={img.id}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveImage(img)}
          >
            <img
              src={img.url}
              alt={img.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            />
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
          </div>
        ))}
      </div>

      {activeImage && (
        <FullscreenImageViewer image={activeImage} onClose={() => setActiveImage(null)} />
      )}
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