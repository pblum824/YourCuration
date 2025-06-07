import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';
import { loadBlob } from './utils/dbCache';

export default function CuratedGallery1() {
  const { artistGallery = [], ratings = {} } = useCuration();

  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const result = curateGallery1({ artistGallery, ratings });
      const all = [...(result.strong || []), ...(result.medium || []), ...(result.weak || [])];

      async function hydrate() {
        const hydrated = await Promise.all(
          all.map(async (img) => {
            try {
              const blob = await loadBlob(img.localRefId);
              const url = URL.createObjectURL(blob);
              return { id: img.id, name: img.name, url };
            } catch {
              return { id: img.id, name: img.name, url: '' };
            }
          })
        );
        setImages(hydrated);
      }

      hydrate();
    } catch (err) {
      setError(err.message || 'CG1 failed to process.');
    }
  }, [artistGallery, ratings]);

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        ❌ CG1 Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Curated Gallery Preview
      </h2>

      <div style={{ fontFamily: 'monospace', color: '#888', marginBottom: '1rem' }}>
        Showing {images.length} hydrated images
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}
      >
        {images.map((img) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            />
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}