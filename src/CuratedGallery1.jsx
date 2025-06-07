import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';
import { loadBlob } from './utils/dbCache';

const LABELS = ['Less', 'Maybe', 'Yes!!'];

export default function CuratedGallery1({ setView }) {
  const {
    artistGallery = [],
    ratings = {},
    galleryRatings,
    setGalleryRatings
  } = useCuration();

  const [groups, setGroups] = useState({ strong: [], medium: [], weak: [] });
  const [hydrated, setHydrated] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const result = curateGallery1({ artistGallery, ratings });
      const all = [...(result.strong || []), ...(result.medium || []), ...(result.weak || [])];

      setGroups({
        strong: result.strong || [],
        medium: result.medium || [],
        weak: result.weak || []
      });

      async function hydrate() {
        const hydrated = await Promise.all(
          all.map(async (img) => {
            try {
              const blob = await loadBlob(img.localRefId);
              const url = URL.createObjectURL(blob);
              return {
                id: img.id,
                name: img.name,
                url,
                matchScore: img.matchScore
              };
            } catch {
              return { id: img.id, name: img.name, url: '', matchScore: img.matchScore };
            }
          })
        );
        setHydrated(hydrated);
      }

      hydrate();
    } catch (err) {
      setError(err.message || 'CG1 failed to process.');
    }
  }, [artistGallery, ratings]);

  const handleToggle = (id) => {
    setGalleryRatings((prev) => {
      const current = prev[id] ?? 1;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  const renderTier = (label, tierArray) => {
    const tierImages = hydrated.filter((img) => tierArray.some((t) => t.id === img.id));
    if (tierImages.length === 0) return null;

    return (
      <>
        <h3 style={{ marginTop: '2rem', fontSize: '1.25rem', color: '#1e3a8a' }}>{label}</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
          }}
        >
          {tierImages.map((img) => (
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
              <p style={{ fontSize: '0.85rem', color: '#555' }}>score: {img.matchScore?.toFixed(2)}</p>
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
      </>
    );
  };

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
        Showing {hydrated.length} hydrated images across {Object.keys(groups).length} tiers.
      </div>

      {renderTier('✅ Strong Matches', groups.strong)}
      {renderTier('🤔 Medium Matches', groups.medium)}
      {renderTier('🧠 Weak Matches', groups.weak)}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => setView('curated2')}
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
          ➕ Show Me More Like These
        </button>
      </div>
    </div>
  );
}