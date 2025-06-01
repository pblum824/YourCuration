// File: src/CuratedGallery1.jsx
import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';

const LABELS = ['Less', 'Maybe', 'Yes!!'];

export default function CuratedGallery1() {
  const { artistGallery = [], ratings = {} } = useCuration();
  const [selections, setSelections] = useState({});

  let strong = [], medium = [], weak = [];
  try {
    const result = curateGallery1({ artistGallery, ratings });
    strong = result.strong || [];
    medium = result.medium || [];
    weak = result.weak || [];
  } catch (err) {
    return <p style={{ color: 'red' }}>Error generating curated gallery: {err.message}</p>;
  }

  const all = [...strong, ...medium, ...weak];

  const handleToggle = (id) => {
    setSelections((prev) => {
      const current = prev[id] || 1; // default to Maybe
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', fontSize: '2rem', marginBottom: '1rem', color: '#1e3a8a' }}>
        Curated Gallery Preview
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
        }}
      >
        {all.map((img) => (
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
            <button
              onClick={() => handleToggle(img.id)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
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
    </div>
  );
}