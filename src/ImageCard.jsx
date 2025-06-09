// File: src/ImageCard.jsx
import React from 'react';
import EditableTagSection from './EditableTagSection';

export default function ImageCard({ image, onToggleSample, onToggleGallery, onToggleScrape, onRemove, onUpdateTag, sampleWarningId }) {
  return (
    <div style={{ width: '280px', textAlign: 'center' }}>
      <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '0.5rem' }}>
        <img
          src={image.url}
          alt={image.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{image.name}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => onToggleScrape?.(image.id)} style={buttonStyle(image.scrapeEligible ? '#d1fae5' : '#fee2e2')}>Scrape</button>
        <button onClick={() => onToggleGallery?.(image.id)} style={buttonStyle(image.galleryEligible ? '#dbeafe' : '#f3f4f6')}>Gallery</button>
        <button onClick={() => onToggleSample?.(image.id)} style={buttonStyle(image.sampleEligible ? '#fef9c3' : '#f3f4f6')}>Sample</button>
        <button onClick={() => onRemove?.(image.id)} style={buttonStyle('#fee2e2', '#991b1b')}>Remove</button>
      </div>

      <div style={{ height: '120px', marginTop: '0.5rem' }}>
        <div style={{ minHeight: '1.5rem' }}>
          {image.metadata?.imageTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>[image]</strong> {image.metadata.imageTags.join(', ')}
            </div>
          )}
        </div>
        <div style={{ minHeight: '1.5rem' }}>
          {image.metadata?.textTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>[text]</strong> {image.metadata.textTags.join(', ')}
            </div>
          )}
        </div>
        <div style={{ minHeight: '1.5rem' }}>
          {image.metadata?.toneTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>[tone]</strong> {image.metadata.toneTags.join(', ')}
            </div>
          )}
        </div>
        <div style={{ minHeight: '1.5rem' }}>
          {image.metadata?.moodTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>[mood]</strong> {image.metadata.moodTags.join(', ')}
            </div>
          )}
        </div>
        <div style={{ minHeight: '1.5rem' }}>
          {image.metadata?.paletteTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>[palette]</strong> {image.metadata.paletteTags.join(', ')}
            </div>
          )}
        </div>
        <div style={{ minHeight: '1.5rem' }}>
          {image.metadata?.error && (
            <div style={{ color: 'red', fontSize: '0.8rem' }}>
              <strong>Error:</strong> {image.metadata.error}
            </div>
          )}
        </div>
      </div>

      <EditableTagSection image={image} onUpdateTag={onUpdateTag} />

      {sampleWarningId === image.id && (
        <div
          style={{
            marginTop: '0.75rem',
            fontSize: '0.85rem',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '1px solid #facc15',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
          }}
        >
          To make SampleRater quick and easy for your clients,<br />
          we recommend selecting no more than 15 samples.
        </div>
      )}
    </div>
  );
}

function buttonStyle(bg, text = '#111') {
  return {
    padding: '0.35rem 0.75rem',
    fontSize: '0.85rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: bg,
    color: text,
    cursor: 'pointer',
  };
}