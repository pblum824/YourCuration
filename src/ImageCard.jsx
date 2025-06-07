// File: src/ImageCard.jsx
import React from 'react';
import { imageButton } from './utils/styles';

export default function ImageCard({
  image,
  onToggleScrape,
  onRemove,
  onToggleGallery,
  onToggleSample,
  devMode = false,
}) {
  if (!image) return null;

  return (
    <div
      style={{
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <img
        src={image.url}
        alt={image.name}
        style={{
          height: '200px',
          width: '100%',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      />
      <p
        style={{
          fontStyle: 'italic',
          fontFamily: 'sans-serif',
          marginTop: '0.5rem',
        }}
      >
        {image.name}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginTop: '0.5rem',
        }}
      >
        <button
          onClick={() => onToggleScrape?.(image.id)}
          style={imageButton(image.scrapeEligible ? '#d1fae5' : '#fee2e2')}
        >
          {image.scrapeEligible ? 'Accepted' : 'Excluded'}
        </button>
        <button
          onClick={() => onRemove?.(image.id)}
          style={imageButton('#fee2e2', '#991b1b')}
        >
          Remove
        </button>
        <button
          onClick={() => onToggleGallery?.(image.id)}
          style={imageButton(image.galleryEligible ? '#dbeafe' : '#f3f4f6')}
        >
          Gallery
        </button>
        <button
          onClick={() => onToggleSample?.(image.id)}
          style={imageButton(image.sampleEligible ? '#fef9c3' : '#f3f4f6')}
        >
          Sample
        </button>
      </div>

      {devMode && (
        <pre
          style={{
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            textAlign: 'left',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(image.metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}