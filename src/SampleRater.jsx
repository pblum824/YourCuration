import React, { useEffect, useState } from 'react';
import './SampleRater.css';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';

const SAMPLE_OPTIONS = ['love', 'like', 'less'];

export default function SampleRater({ images, setView }) {
  const { ratings, setRatings } = useCuration();
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

  if (!hydratedImages || hydratedImages.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '2rem', color: '#999' }}>No images to rate.</p>;
  }

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
        Rate Your Sample Images
      </h2>

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
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
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

      {/* Forward button */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => setView('curated1')}
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
          ➡️ Generate Gallery Preview
        </button>
      </div>
    </div>
  );
}