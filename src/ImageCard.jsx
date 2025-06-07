// File: src/ImageCard.jsx

import React from 'react';

export default function ImageCard({
  image,
  onToggleSample,
  onToggleGallery,
  onToggleScrape,
  onRemove,
}) {
  const imageButton = (bg, color = '#1e3a8a') => ({
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: bg,
    color,
    cursor: 'pointer',
    minWidth: '96px',
  });

  return (
    <div style={{
      width: '280px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '1rem'
    }}>
      <img
        src={image.url}
        alt={image.name}
        style={{ width: '100%', borderRadius: '0.5rem' }}
      />
      <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{image.name}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginTop: '0.5rem',
          width: '100%',
        }}
      >
        <button
          onClick={() => onToggleScrape(image.id)}
          style={imageButton(image.scrapeEligible ? '#d1fae5' : '#fee2e2')}
        >
          {image.scrapeEligible ? 'Accepted' : 'Excluded'}
        </button>
        <button
          onClick={() => onToggleGallery(image.id)}
          style={imageButton(image.galleryEligible ? '#dbeafe' : '#f3f4f6')}
        >
          Gallery
        </button>
        <button
          onClick={() => onToggleSample(image.id)}
          style={imageButton(image.sampleEligible ? '#fef9c3' : '#f3f4f6')}
        >
          Sample
        </button>
        <button
          onClick={() => onRemove(image.id)}
          style={imageButton('#fee2e2', '#991b1b')}
        >
          Remove
        </button>
      </div>
    </div>
  );
}