import React from 'react';
import { useCuration } from './YourCurationContext';

export default function SampleRater() {
  const { artistGallery, ratings, setRatings } = useCuration();
  const artistSamples = artistGallery.filter(img => img.sampleEligible);

  const handleRate = (id, value) => {
    setRatings({ ...ratings, [id]: value });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          justifyContent: 'center',
          alignItems: 'start',
        }}
      >
        {artistSamples.map((img) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{
                width: '100%',
                maxWidth: '320px',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontFamily: 'Parisienne, cursive', fontSize: '1.1rem' }}>
              {img.name}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => handleRate(img.id, 'love')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fde68a',
                  border: '1px solid #facc15',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                Love!
              </button>
              <button
                onClick={() => handleRate(img.id, 'like')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e0f2fe',
                  border: '1px solid #38bdf8',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                Like
              </button>
              <button
                onClick={() => handleRate(img.id, 'down')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #f87171',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                Less of this
              </button>
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#555' }}>
              Selected: {ratings[img.id] || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}