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
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}
      >
        {artistSamples.map((img) => (
          <div
            key={img.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              textAlign: 'center',
              maxWidth: '320px'
            }}
          >
            <img
              src={img.url}
              alt={img.name}
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
              }}
            />
            <p style={{ marginTop: '0.5rem', fontFamily: 'sans-serif', fontStyle: 'italic' }}>{img.name}</p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '0.75rem',
                fontFamily: 'Parisienne, cursive'
              }}
            >
              <button
                onClick={() => handleRate(img.id, 'love')}
                style={{
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  minWidth: '80px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Love!
              </button>
              <button
                onClick={() => handleRate(img.id, 'like')}
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#1e3a8a',
                  minWidth: '80px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Like
              </button>
              <button
                onClick={() => handleRate(img.id, 'less')}
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  minWidth: '80px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Less
              </button>
            </div>

            <p style={{ marginTop: '0.25rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
              Selected: {ratings[img.id] || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}