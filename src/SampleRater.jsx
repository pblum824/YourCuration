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
      {artistSamples.map((img) => (
        <div key={img.id} style={{ marginBottom: '1.5rem' }}>
          <img
            src={img.url}
            alt={img.name}
            style={{
              width: '240px',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '0.5rem',
            }}
          />
          <div>
            <button
              onClick={() => handleRate(img.id, 'up')}
              style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}
            >
              👍
            </button>
            <button
              onClick={() => handleRate(img.id, 'down')}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              👎
            </button>
          </div>
          <div style={{ marginTop: '0.25rem', color: '#555' }}>
            Rated: {ratings[img.id] || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}