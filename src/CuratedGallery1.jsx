import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';
import { loadBlob } from './utils/dbCache';

const LABELS = ['Less', 'Maybe', 'Yes!!'];

export default function CuratedGallery1() {
  const {
    artistGallery = [],
    ratings = {},
    galleryRatings,
    setGalleryRatings
  } = useCuration();

  const [hydrated, setHydrated] = useState([]);
  const [strong, setStrong] = useState([]);
  const [medium, setMedium] = useState([]);
  const [weak, setWeak] = useState([]);

  useEffect(() => {
    const result = curateGallery1({ artistGallery, ratings });
    const all = [...(result.strong || []), ...(result.medium || []), ...(result.weak || [])];
    setStrong(result.strong || []);
    setMedium(result.medium || []);
    setWeak(result.weak || []);

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
      setHydrated(hydrated);
    }

    hydrate();
  }, [artistGallery, ratings]);

  const handleToggle = (id) => {
    setGalleryRatings((prev) => {
      const current = prev[id] ?? 1;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2
        style={{
          fontFamily: 'Parisienne, cursive',
          fontSize: '2rem',
          marginBottom: '1rem',
          color: '#1e3a8a'
        }}
      >
        Curated Gallery Preview
      </h2>

      {/* Debug display */}
      <div style={{ fontFamily: 'monospace', color: '#888', marginBottom: '1rem' }}>
        Debug: strong={strong.length} | medium={medium.length} | weak={weak.length} | hydrated={hydrated.length}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}
      >
        {hydrated.map((img) => (
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
            <button
              onClick={() => handleToggle(img.id)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                fontFamily: 'Parisienne, cursive',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor:
                  galleryRatings[img.id] === 2
                    ? '#d1fae5'
                    : galleryRatings[img.id] === 1
                    ? '#fef9c3'
                    : '#fee2e2',
                color: '#1e3a8a',
                cursor: 'pointer'
              }}
            >
              {LABELS[galleryRatings[img.id] ?? 1]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}