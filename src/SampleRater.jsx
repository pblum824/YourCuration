// File: src/SampleRater.jsx
import React, { useEffect, useState } from 'react';
import './SampleRater.css';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import ControlBar from './utils/ControlBar';
import { useDevMode } from './context/DevModeContext';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';

const SAMPLE_OPTIONS = ['love', 'like', 'less'];

export default function SampleRater({ images, setView, isClientView = false }) {
  const { ratings, setRatings, mode } = useCuration();
  const { devMode, setDevMode } = useDevMode();
  const { selectedFont } = useFontSettings();
  const [hydratedImages, setHydratedImages] = useState([]);

  useEffect(() => {
    async function hydrate() {
      const hydrated = await Promise.all(
        images.map(async (img) => {
          if (!img.localRefId) return img;
          try {
            const blob = await loadBlob(img.localRefId);
            const url = URL.createObjectURL(blob);
            return { id: img.id, name: img.name, url };
          } catch {
            return { id: img.id, name: img.name, url: '' };
          }
        })
      );
      setHydratedImages(hydrated);
    }
    hydrate();
  }, [images]);

  const setRating = (id, value) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  const ratedCount = Object.keys(ratings).length;
  const isDisabled = ratedCount !== 15;

  if (!hydratedImages || hydratedImages.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '2rem', color: '#999' }}>No images to rate.</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {!isClientView && (
        <ControlBar view="rate" setView={setView} devMode={devMode} setDevMode={setDevMode} />
      )}

      <h2
        style={{
          ...getFontStyle(mode, { selectedFont }),
          fontSize: '2rem',
          marginBottom: '0.25rem',
          color: '#1e3a8a'
        }}
      >
        Please Rate These Artist Samples
      </h2>
      <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '1.5rem' }}>
        (The curation works best if you rate all 15.)
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}
      >
        {hydratedImages.map((img) => {
          const rating = ratings[img.id];
          return (
            <div key={img.id} style={{ textAlign: 'center' }}>
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
              <p style={{ fontStyle: 'italic', marginTop: '0.5rem', ...getFontStyle(mode, { selectedFont }) }}>{img.name}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                {SAMPLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setRating(img.id, option)}
                    className={`rate-btn ${rating === option ? 'selected ' + option : option}`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!isClientView && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => setView('curated1')}
            disabled={isDisabled}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: isDisabled ? '#d1d5db' : '#1e3a8a',
              color: isDisabled ? '#666' : '#fff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
            }}
          >
            ➡️ Generate Gallery Preview
          </button>
        </div>
      )}
    </div>
  );
}