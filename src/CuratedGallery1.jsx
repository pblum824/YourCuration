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
      const all = [
        ...(result.strong || []),
        ...(result.medium || []),
        ...(result.weak || [])
      ];

      async function hydrate() {
        const hydrated = await Promise.all(
          all.map(async (img) => {
            try {
              const blob = await loadBlob(img.localRefId);
              const url = URL.createObjectURL(blob);
              const score = img.matchScore ?? null;
              console.log('Hydrate:', { id: img.id, matchScore: score });
              return {
                id: img.id,
                name: img.name,
                url,
                matchScore: score,
              };
            } catch (err) {
              console.warn('Failed to hydrate', img.name);
              return { id: img.id, name: img.name, url: '', matchScore: null };
            }
          })
        );
        setImages(hydrated);
      }

      hydrate();
    } catch (err) {
      setError(err.message || 'CG1 failed to initialize.');
    }
  }, [artistGallery, ratings]);

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        ❌ CG1 Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>Debug CG1: Hydration + Score Check</h2>

      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333' }}>
        {images.length === 0 && <p>No images hydrated.</p>}
        {images.map((img) => (
          <div key={img.id} style={{ marginBottom: '1rem' }}>
            <p>
              <strong>{img.name}</strong><br />
              score = {img.matchScore === null ? '—' : img.matchScore}
            </p>
            {img.url && (
              <img
                src={img.url}
                alt={img.name}
                style={{ width: '220px', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}