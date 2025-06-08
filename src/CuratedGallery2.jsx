// File: src/CuratedGallery2.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { aggregateSampleTags, scoreImage, extractAllTags } from './utils/scoreImage';
import { loadBlob } from './utils/dbCache';

export default function CuratedGallery2({ setView }) {
  const {
    artistGallery = [],
    ratings = {},
    setCG2Selections
  } = useCuration();

  const [candidates, setCandidates] = useState([]);
  const [hydrated, setHydrated] = useState([]);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const samples = artistGallery.filter((img) => ratings[img.id]);
      const rawCandidates = artistGallery.filter(
        (img) => img.galleryEligible && !ratings[img.id]
      );
      const tagPools = aggregateSampleTags(samples, ratings);
      const safe = rawCandidates.filter((img) => {
        const tags = extractAllTags(img.metadata || {});
        return tags.every((tag) => !tagPools.less.has(tag));
      });
      const scored = safe
        .map((img) => ({
          ...img,
          matchScore: scoreImage(img, tagPools),
        }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setCandidates(scored.slice(0, 20));
    } catch (err) {
      setError(err.message || 'CG2 scoring failed.');
    }
  }, [artistGallery, ratings]);

  useEffect(() => {
    async function hydrate() {
      const hydrated = await Promise.all(
        candidates.map(async (img) => {
          try {
            const blob = await loadBlob(img.localRefId);
            const url = URL.createObjectURL(blob);
            return {
              id: img.id,
              name: img.name,
              localRefId: img.localRefId,
              url,
              matchScore: img.matchScore,
            };
          } catch {
            return {
              id: img.id,
              name: img.name,
              localRefId: img.localRefId,
              url: '',
              matchScore: img.matchScore,
            };
          }
        })
      );
      setHydrated(hydrated);
    }
    if (candidates.length > 0) hydrate();
  }, [candidates]);

  const approveImage = (id) => {
    setSelections((prev) => ({ ...prev, [id]: 2 }));
  };

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>❌ CG2 Error: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Still You — But More
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2rem',
          justifyItems: 'center',
        }}
      >
        {hydrated.map((img) => {
          const isSelected = selections[img.id] === 2;
          return (
            <div key={img.id} style={{ textAlign: 'center' }}>
              {img.url ? (
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
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6',
                    borderRadius: '0.5rem',
                    color: '#999',
                    fontStyle: 'italic',
                  }}
                >
                  image not loaded
                </div>
              )}
              <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
              <p style={{ fontSize: '0.85rem', color: '#555' }}>
                score: {typeof img.matchScore === 'number' ? img.matchScore : '—'}
              </p>
              <button
                onClick={() => approveImage(img.id)}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'Parisienne, cursive',
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ccc',
                  backgroundColor: isSelected ? '#86efac' : '#d1fae5',
                  boxShadow: isSelected ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  color: '#065f46',
                  cursor: 'pointer',
                }}
              >
                More Like This
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => {
            setCG2Selections(selections);
            setView('curatedFinal');
          }}
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
          ✅ Finalize My Gallery
        </button>
      </div>
    </div>
  );
}