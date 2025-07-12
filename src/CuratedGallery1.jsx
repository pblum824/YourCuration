// File: src/CuratedGallery1.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadImage, getImageStorageMode } from './utils/imageStore';
import ControlBar from './utils/ControlBar';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';
import { aggregateSampleTags, scoreImage } from './utils/scoreImage';

export default function CuratedGallery1({ setView, onReturn }) {
  const {
    artistGallery = [],
    ratings = {},
    setCG1Selections,
    devMode,
    mode
  } = useCuration();

  const { selectedFont } = useFontSettings();
  const [hydrated, setHydrated] = useState([]);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState(null);
  const isClientView = mode === 'client';

  useEffect(() => {
    try {
      const samples = artistGallery.filter((img) => ratings[img.id]);
      const tagPools = aggregateSampleTags(samples, ratings);

      const candidates = artistGallery
        .filter((img) => img.galleryEligible && !ratings[img.id])
        .map((img) => ({
          ...img,
          matchScore: scoreImage(img, tagPools)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);

      async function hydrate() {
        const hydrated = await Promise.all(
          candidates.map(async (img) => {
            try {
              const blob = await loadImage(img.localRefId);
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
    } catch (err) {
      setError(err.message || 'CG1 failed to process.');
    }
  }, [artistGallery, ratings]);

  const approveImage = (id) => {
    setSelections((prev) => ({
      ...prev,
      [id]: prev[id] === 2 ? undefined : 2
    }));
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        ❌ CG1 Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      {!isClientView && <ControlBar view="curated1" setView={setView} />}

      {isClientView && onReturn && (
        <button
          onClick={onReturn}
          style={{
            position: 'fixed',
            top: '0.75rem',
            right: '0.75rem',
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            zIndex: 999,
            cursor: 'pointer',
            color: '#333'
          }}
        >
          Return to Artist Dashboard
        </button>
      )}

      <h2 style={{ ...getFontStyle(mode, { selectedFont }), color: '#1e3a8a' }}>
        Curated Gallery Preview
      </h2>
      <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#666' }}>
        Storage Mode: {getImageStorageMode()}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2rem',
          justifyItems: 'center'
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
                    objectFit: 'contain',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
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
                    fontStyle: 'italic'
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
                  ...getFontStyle(mode, { selectedFont }),
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ccc',
                  backgroundColor: isSelected ? '#86efac' : '#d1fae5',
                  boxShadow: isSelected ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  color: '#065f46',
                  cursor: 'pointer'
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
            setCG1Selections(selections);
            setView('curated2');
          }}
          style={{ 
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: '#1e3a8a',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ➕ Show Me More Like These
        </button>
      </div>
    </div>
  );
}