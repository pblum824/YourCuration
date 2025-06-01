// File: components/GalleryGrid.jsx
import React from 'react';
import { imageButton } from './utils/styles';

export default function GalleryGrid({ images, onToggleScrape, onRemove, onToggleGallery, onToggleSample, devMode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'flex-end',
        minHeight: '240px',
      }}
    >
      {images.filter(img => img?.id && img?.url && img?.name).map((img) => (
        <div
          key={img.id}
          style={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <img
            src={img.url}
            alt={img.name}
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
            {img.name}
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
              onClick={() => onToggleScrape(img.id)}
              style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
            >
              {img.scrapeEligible ? 'Accepted' : 'Excluded'}
            </button>
            <button
              onClick={() => onRemove(img.id)}
              style={imageButton('#fee2e2', '#991b1b')}
            >
              Remove
            </button>
            <button
              onClick={() => onToggleGallery(img.id)}
              style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
            >
              Gallery
            </button>
            <button
              onClick={() => onToggleSample(img.id)}
              style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
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
              {JSON.stringify(img.metadata, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}