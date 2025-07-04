// File: src/ImageCard.jsx
import React from 'react';
import EditableTagList from './EditableTagList';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';
import { useCuration } from './YourCurationContext';

export default function ImageCard({
  image,
  onToggleSample,
  onToggleGallery,
  onToggleScrape,
  onRemove,
  sampleWarningId,
  devMode = false,
  onUpdateTag = () => {},
}) {
  const { selectedFont } = useFontSettings();
  const { mode } = useCuration();
  const metadata = image.metadata || {};

  return (
    <div style={{ width: '280px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '200px', overflow: 'hidden', borderRadius: '0.5rem' }}>
        <img
          src={image.url}
          alt={image.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'contain',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      <div style={{ paddingTop: '0.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <p style={{ fontStyle: 'italic', marginBottom: '0.5rem', ...getFontStyle(mode, { selectedFont }) }}>{image.name}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={() => onToggleScrape?.(image.id)} style={buttonStyle(image.scrapeEligible ? '#d1fae5' : '#fee2e2')}>Scrape</button>
          <button onClick={() => onRemove?.(image.id)} style={buttonStyle('#fee2e2', '#991b1b')}>Remove</button>
          <button onClick={() => onToggleGallery?.(image.id)} style={buttonStyle(image.galleryEligible ? '#dbeafe' : '#f3f4f6')}>Gallery</button>
          <button onClick={() => onToggleSample?.(image.id)} style={buttonStyle(image.sampleEligible ? '#fef9c3' : '#f3f4f6')}>Sample</button>
        </div>

        <div style={{ height: '120px', overflow: 'hidden', marginTop: '0.75rem', fontSize: '0.85rem' }}>
          {metadata.imageTags?.length > 0 && (
            <div>
              <strong>[image]</strong> {metadata.imageTags.join(', ')}
            </div>
          )}
          {metadata.textTags?.length > 0 && (
            <div>
              <strong>[text]</strong> {metadata.textTags.join(', ')}
            </div>
          )}
          {metadata.toneTags?.length > 0 && (
            <div>
              <strong>[tone]</strong> {metadata.toneTags.join(', ')}
            </div>
          )}
          {metadata.moodTags?.length > 0 && (
            <div>
              <strong>[mood]</strong> {metadata.moodTags.join(', ')}
            </div>
          )}
          {metadata.paletteTags?.length > 0 && (
            <div>
              <strong>[palette]</strong> {metadata.paletteTags.join(', ')}
            </div>
          )}
          {sampleWarningId === image.id && (
            <div
              style={{
                marginTop: '0.5rem',
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

        {devMode && (
          <div style={{ marginTop: '0.5rem' }}>
            <EditableTagList
              tags={metadata.editableTags || []}
              onChange={(updated) => onUpdateTag(image.id, 'editableTags', updated)}
            />
          </div>
        )}
      </div>
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