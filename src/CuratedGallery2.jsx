// File: src/CuratedGallery2.jsx
import React, { useState, useEffect } from 'react';
import { useCuration } from './YourCurationContext';
import { aggregateSampleTags, scoreImage, extractAllTags } from './utils/scoreImage';
import { loadBlob } from './utils/dbCache';
import { useDevMode } from './context/DevModeContext';

export default function CuratedGallery2({ setView }) {
  const { artistGallery, ratings, CG1Selections } = useCuration();
  const { devMode } = useDevMode();
  const [exploratory, setExploratory] = useState([]);
  const [selections, setSelections] = useState({});

  const approveImage = (id) => {
    setSelections((prev) => ({ ...prev, [id]: 2 }));
  };

  useEffect(() => {
    const samples = artistGallery.filter((img) => ratings[img.id]);
    const candidates = artistGallery.filter(
      (img) => img.galleryEligible && !ratings[img.id]
    );

    const tagPools = aggregateSampleTags(samples, ratings);

    const scored = candidates.map((img) => {
      const tags = extractAllTags(img.metadata);
      const overlaps = tags.filter((tag) => !tagPools.less.has(tag));
      const matchScore = scoreImage(img, tagPools);
      return { ...img, matchScore, tagCount: overlaps.length };
    });

    const sorted = scored
      .filter((img) => img.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    Promise.all(
      sorted.map(async (img) => {
        try {
          const blob = await loadBlob(img.localRefId);
          const url = URL.createObjectURL(blob);
          return { ...img, url };
        } catch {
          return { ...img, url: '' };
        }
      })
    ).then(setExploratory);
  }, [artistGallery, ratings]);

  return (
    <div style={{ padding: '2rem' }}>
      {setView && (
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

      <h2 style={{ fontFamily: 'Parisienne, cursive', fontSize: '2rem', marginBottom: '1rem', color: '#1e3a8a' }}>
        Still You — But More
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2rem',
        }}
      >
        {exploratory.map((img) => {
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
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontStyle: 'italic',
                  }}
                >
                  image not loaded
                </div>
              )}
              <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
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
              {devMode && (
                <pre style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: '#666', textAlign: 'left' }}>
                  Score: {img.matchScore}\nOverlaps: {img.tagCount}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => setView('curatedFinal')}
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
          ✅ Show Final Gallery
        </button>
      </div>
    </div>
  );
}