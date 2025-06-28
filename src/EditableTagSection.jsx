// File: src/components/EditableTagSection.jsx
import React from 'react';
import EditableTagList from './EditableTagList';

const tagFields = [
  { key: 'imageTags', label: '[image]' },
  { key: 'textTags', label: '[text]' },
  { key: 'toneTags', label: '[tone]' },
  { key: 'moodTags', label: '[mood]' },
  { key: 'paletteTags', label: '[palette]' },
  { key: 'customTags', label: '[custom]' },
];

export default function EditableTagSection({ image, onUpdateTag }) {
  const handleChange = (field, updatedTags) => {
    onUpdateTag(image.id, field, updatedTags);
  };

  return (
    <div style={{ marginTop: '0.5rem', fontFamily: 'sans-serif' }}>
      {tagFields.map(({ key, label }) => {
        const tags = image.metadata?.[key] || [];
        return (
          <div key={key} style={{ marginBottom: '0.5rem' }}>
            <strong>{label}</strong>
            <EditableTagList
              tags={tags}
              onChange={(updated) => handleChange(key, updated)}
            />
          </div>
        );
      })}
    </div>
  );
}