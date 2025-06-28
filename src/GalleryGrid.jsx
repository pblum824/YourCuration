// File: src/GalleryGrid.jsx
import React from 'react';
import { imageButton } from './utils/styles';
import EditableTagSection from './EditableTagSection';

export default function GalleryGrid({
  images,
  onToggleScrape,
  onRemove,
  onToggleGallery,
  onToggleSample,
  devMode,
  sampleWarningId,
  onUpdateTag,
  showTags,
}) {
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
      {images.map((img) => (
        <div
          key={img.id}
          style={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            position: 'relative',
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
              onClick={() => onToggleScrape?.(img.id)}
              style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
            >
              {img.scrapeEligible ? 'Accepted' : 'Excluded'}
            </button>
            <button
              onClick={() => onRemove?.(img.id)}
              style={imageButton('#fee2e2', '#991b1b')}
            >
              Remove
            </button>
            <button
              onClick={() => onToggleGallery?.(img.id)}
              style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
            >
              Gallery
            </button>
            <button
              onClick={() => onToggleSample?.(img.id)}
              style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
            >
              Sample
            </button>
          </div>

          {sampleWarningId === img.id && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                zIndex: 999,
                fontSize: '0.85rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #facc15',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              To make SampleRater quick and easy for your clients,<br />
              we recommend selecting no more than 15 samples.
            </div>
          )}

          {showTags && (
            <div
              style={{
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                maxHeight: '120px',
                overflowY: 'auto',
                width: '100%',
                padding: '0.25rem',
              }}
            >
              {img.metadata?.imageTags?.length > 0 && (
                <div>
                  <strong>[image]</strong> {img.metadata.imageTags.join(', ')}
                </div>
              )}
              {img.metadata?.textTags?.length > 0 && (
                <div>
                  <strong>[text]</strong> {img.metadata.textTags.join(', ')}
                </div>
              )}
              {img.metadata?.toneTags?.length > 0 && (
                <div>
                  <strong>[tone]</strong> {img.metadata.toneTags.join(', ')}
                </div>
              )}
              {img.metadata?.moodTags?.length > 0 && (
                <div>
                  <strong>[mood]</strong> {img.metadata.moodTags.join(', ')}
                </div>
              )}
              {img.metadata?.paletteTags?.length > 0 && (
                <div>
                  <strong>[palette]</strong> {img.metadata.paletteTags.join(', ')}
                </div>
              )}
              {img.metadata?.customTags?.length > 0 && (
                <div>
                  <strong>[custom]</strong> {img.metadata.customTags.join(', ')}
                </div>
              )}
              {img.metadata?.error && (
                <div style={{ color: 'red', fontSize: '0.8rem' }}>
                  <strong>Error:</strong> {img.metadata.error}
                </div>
              )}
              <EditableTagSection image={img} onUpdateTag={onUpdateTag} />
            </div>
          )}

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