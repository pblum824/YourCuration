// File: src/CuratedGallery2.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { aggregateSampleTags, scoreImage, extractAllTags } from './utils/scoreImage';
import { loadBlob } from './utils/dbCache';
import ControlBar from './utils/ControlBar';

const LABELS = ['Less', 'Maybe', 'Yes!!'];

export default function CuratedGallery2({ setView }) {
  const { artistGallery, ratings, devMode, setCG2Selections } = useCuration();
  const [hydrated, setHydrated] = useState([]);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    const samples = artistGallery.filter((img) => ratings[img.id]);
    const candidates = artistGallery.filter((img) => img.galleryEligible && !ratings[img.id]);
    const tagPools = aggregateSampleTags(samples, ratings);

    const scored = candidates
      .map((img) => {
        const tags = extractAllTags(img.metadata);
        const hasLessMatch = tags.some((tag) => tagPools.less.has(tag));
        const score = scoreImage(img, tagPools);
        return hasLessMatch ? null : { ...img, matchScore: score };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    async function hydrate() {
      const hydrated = await Promise.all(
        scored.map(async (img) => {
          try {
            const blob = await loadBlob(img.localRefId);
            const url = URL.createObjectURL(blob);
            return { ...img, url };
          } catch {
            return { ...img, url: '' };
          }
        })
      );
      setHydrated(hydrated);
    }

    hydrate();
  }, [artistGallery, ratings]);

  const toggleSelection = (id) => {
    setSelections((prev) => {
      const current = prev[id] || 1;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <ControlBar view="curated2" setView={setView} />

      <h2 style={{ fontFamily: 'Parisienne, cursive', fontSize: '2rem', marginBottom: '1rem', color: '#1e3a8a' }}>
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
        {hydrated.map((img) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            {img.url ? (
              <img
                src={img.url}
                alt={img.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'contain',
                  backgroundColor: '#f9fafb',
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
            {devMode && (
              <p style={{ fontSize: '0.75rem', color: '#666' }}>
                Score: {img.matchScore}
              </p>
            )}
            <button
              onClick={() => toggleSelection(img.id)}
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1.25rem',
                fontFamily: 'Parisienne, cursive',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor:
                  selections[img.id] === 2
                    ? '#d1fae5'
                    : selections[img.id] === 1
                    ? '#fef9c3'
                    : '#fee2e2',
                color: '#1e3a8a',
                cursor: 'pointer',
              }}
            >
              {LABELS[selections[img.id] || 1]}
            </button>
          </div>
        ))}
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
          ✅ Build Final Gallery
        </button>
      </div>
    </div>
  );
}