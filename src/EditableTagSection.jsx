// File: src/EditableTagSection.jsx
import React from 'react';
import EditableTagList from './EditableTagList';

export default function EditableTagSection({ image, onUpdateTag, devMode, showTags }) {
  if (!image?.metadata || (!devMode && !showTags)) return null;

  const keys = ['imageTags', 'textTags', 'toneTags', 'moodTags', 'paletteTags'];
  const labels = {
    imageTags: '[image]',
    textTags: '[text]',
    toneTags: '[tone]',
    moodTags: '[mood]',
    paletteTags: '[palette]'
  };

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {keys.map((key) => (
        <div key={key} style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{labels[key]}</div>
          <EditableTagList
            tags={image.metadata[key] || []}
            onChange={(newTags) => onUpdateTag?.(image.id, key, newTags)}
          />
        </div>
      ))}
    </div>
  );
}