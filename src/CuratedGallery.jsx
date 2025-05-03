// src/CuratedGallery.jsx
import React from 'react';
import { useCuration } from './YourCurationContext';

export default function CuratedGallery() {
  const { artistGallery, artistSamples, ratings } = useCuration();

  const lovedSamples = artistSamples.filter(img => ratings[img.id] === 'up');
  const dislikedSamples = artistSamples.filter(img => ratings[img.id] === 'down');

  const lovedTags = lovedSamples.flatMap(img => img.metadata?.imageTags || []);
  const dislikedTags = dislikedSamples.flatMap(img => img.metadata?.imageTags || []);

  const matched = artistGallery.filter(photo => {
    if (!photo.metadata?.imageTags) return false;
    const tags = photo.metadata.imageTags;
    const hasPositive = tags.some(tag => lovedTags.includes(tag));
    const hasNegative = tags.some(tag => dislikedTags.includes(tag));
    return hasPositive && !hasNegative;
  });

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h2
        style={{
          fontSize: '2.25rem',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1e3a8a',
          fontFamily: 'Parisienne, cursive',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Your Curated Gallery
      </h2>

      <div style={{ margin: '0 auto', maxWidth: '700px', textAlign: 'center', marginBottom: '2rem' }}>
        <p><strong>Loved Tags:</strong> {lovedTags.join(', ')}</p>
        <p><strong>Disliked Tags:</strong> {dislikedTags.join(', ')}</p>
      </div>

      {matched.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.25rem', fontStyle: 'italic' }}>
          No matches found from artist gallery.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2.5rem',
          }}
        >
          {matched.map((img, index) => (
            <div key={img?.id || index} style={{ maxWidth: '320px', textAlign: 'center' }}>
              <img
                src={img?.url || img?.src}
                alt={`Matched ${img?.id}`}
                style={{
                  maxWidth: '320px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  objectFit: 'cover',
                }}
              />
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                Tags: {img?.metadata?.imageTags?.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
