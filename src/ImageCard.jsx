// File: components/ImageCard.jsx

import React from 'react';
import EditableTagList from './EditableTagList';

export default function ImageCard({
  image,
  onToggleSample,
  onToggleGallery,
  onToggleScrape,
  onRemove,
  onUpdateTag,
  showMetadata = true,
  editableUserTag = true,
}) {
  const imageButton = (bg, color = '#1e3a8a') => ({
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: bg,
    color,
    cursor: 'pointer',
    minWidth: '96px'
  });

  return (
    <div style={{ width: '280px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <img src={image.url} alt={image.name} style={{ width: '100%', borderRadius: '0.5rem' }} />
      <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{image.name}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button onClick={() => onToggleScrape(image.id)} style={imageButton(image.scrapeEligible ? '#d1fae5' : '#fee2e2')}>
          {image.scrapeEligible ? 'Accepted' : 'Excluded'}
        </button>
        <button onClick={() => onToggleGallery(image.id)} style={imageButton(image.galleryEligible ? '#dbeafe' : '#f3f4f6')}>
          Gallery
        </button>
        <button onClick={() => onToggleSample(image.id)} style={imageButton(image.sampleEligible ? '#fef9c3' : '#f3f4f6')}>
          Sample
        </button>
        <button onClick={() => onRemove(image.id)} style={imageButton('#fee2e2', '#991b1b')}>
          Remove
        </button>
      </div>

      {showMetadata && (
        <>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
            <strong>Tags (backend)</strong>
          </div>

          {image.metadata?.imageTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <strong>[image]</strong> {image.metadata.imageTags.join(', ')}
            </div>
          )}
          {image.metadata?.textTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <strong>[text]</strong> {image.metadata.textTags.join(', ')}
            </div>
          )}
          {image.metadata?.toneTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <strong>[tone]</strong> {image.metadata.toneTags.join(', ')}
            </div>
          )}
          {image.metadata?.moodTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <strong>[mood]</strong> {image.metadata.moodTags.join(', ')}
            </div>
          )}
          {image.metadata?.paletteTags?.length > 0 && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <strong>[palette]</strong> {image.metadata.paletteTags.join(', ')}
            </div>
          )}
        </>
      )}

      {editableUserTag && (
        <>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
            <strong>Tag (user)</strong>
          </div>
          <EditableTagList
            tags={image.metadata?.userTags || []}
            label={'user'}
            onChange={(values) => onUpdateTag(image.id, 'userTags', values)}
          />
        </>
      )}

      {image.metadata?.error && (
        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          <strong>Error:</strong> {image.metadata.error}
        </div>
      )}
    </div>
  );
}