import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';

export default function CuratedGalleryFinal() {
  const {
    artistGallery = [],
    ratings = {},
    cg1Selections = {},
    cg2Selections = {},
  } = useCuration();

  const [finalGallery, setFinalGallery] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const selectedIds = new Set();

    artistGallery.forEach((img) => {
      const isLoved = ratings[img.id] === 'love';
      const isCG1 = cg1Selections[img.id] === 2;
      const isCG2 = cg2Selections[img.id] === 2;
      if (isLoved || isCG1 || isCG2) {
        selectedIds.add(img.id);
      }
    });

    const selectedImages = artistGallery.filter((img) => selectedIds.has(img.id));
    setFinalGallery(selectedImages);
  }, [artistGallery, ratings, cg1Selections, cg2Selections]);

  const exportGallery = async () => {
    try {
      const images = await Promise.all(
        finalGallery.map(async (img) => {
          try {
            const blob = await loadBlob(img.localRefId);
            const base64 = await blobToBase64(blob);
            return {
              id: img.id,
              name: img.name,
              data: base64,
              metadata: img.metadata || {},
              tags: img.metadata?.imageTags || [],
            };
          } catch {
            return null;
          }
        })
      );

      const valid = images.filter(Boolean);

      const bundle = {
        createdAt: new Date().toISOString(),
        count: valid.length,
        images: valid,
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `YourCuration-FinalGallery-${bundle.createdAt.replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message || 'Failed to export gallery.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Final Curated Gallery
      </h2>

      {error && (
        <div style={{ color: 'red', fontFamily: 'monospace' }}>
          ❌ {error}
        </div>
      )}

      <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Total selected images: {finalGallery.length}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
        }}
      >
        {finalGallery.map((img) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            <img
              src={img.url || ''}
              alt={img.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={exportGallery}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: '#1e3a8a',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          💾 Export Final Gallery
        </button>
      </div>
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