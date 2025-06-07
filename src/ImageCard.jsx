// File: src/components/ImageCard.jsx
import React from 'react';

export default function ImageCard({
  image,
  onToggleSample,
  onToggleGallery,
  onToggleScrape,
  onRemove,
  devMode = false,
}) {
  if (!image) return null;

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        margin: '1rem',
        width: '240px',
        textAlign: 'center',
        backgroundColor: '#fff',
      }}
    >
      {devMode && (
        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
          🔍 rendering: {image.name}
        </div>
      )}
      <img
        src={image.url}
        alt={image.name}
        style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}
      />
      <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{image.name}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onToggleScrape?.(image.id)}
          style={{ background: '#d1fae5', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px' }}
        >
          Accepted
        </button>

        <button
          onClick={() => onToggleGallery?.(image.id)}
          style={{ background: '#e0e7ff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px' }}
        >
          Gallery
        </button>

        <button
          onClick={() => onToggleSample?.(image.id)}
          style={{ background: '#ede9fe', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px' }}
        >
          Sample
        </button>

        <button
          onClick={() => onRemove?.(image.id)}
          style={{ background: '#fcdcdc', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}