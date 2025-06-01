// File: src/CuratedGallery2.jsx
import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import { aggregateSampleTags, scoreImage, extractAllTags } from './utils/scoreImage';

const LABELS = ['Less', 'Maybe', 'Yes!!'];

export default function CuratedGallery2() {
  const { artistGallery, ratings } = useCuration();
  const [selections, setSelections] = useState({});

  const samples = artistGallery.filter((img) => ratings[img.id]);
  const candidates = artistGallery.filter(
    (img) => img.galleryEligible && !ratings[img.id]
  );

  const tagPools = aggregateSampleTags(samples, ratings);

  const exploratory = candidates
    .filter((img) => {
      const tags = extractAllTags(img.metadata);
      return tags.every(tag => !tagPools.less.has(tag)); // exclude all "less" matches
    })
    .map((img) => ({
      ...img,
      matchScore: scoreImage(img, tagPools),
    }))
    .filter((img) => img.matchScore >= 2 && img.matchScore <= 6)
    .sort(() => Math.random() - 0.5) // add light randomness
    .slice(0, 15);

  const handleToggle = (id) => {
    setSelections((prev) => {
      const current = prev[id] || 1;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', fontSize: '2rem', marginBottom: '1rem', color: '#1e3a8a' }}>
        Still You — But More
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
        }}
      >
        {exploratory.map((img) => (
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