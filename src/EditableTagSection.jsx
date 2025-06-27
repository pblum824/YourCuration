// File: src/components/EditableTagSection.jsx
import React from 'react';
import EditableTagList from './EditableTagList';

export default function EditableTagSection({ image, onUpdateTag }) {
  const customTags = image.metadata?.customTags || [];

  const handleChange = (updatedTags) => {
    const updatedImage = {
      ...image,
      metadata: {
        ...image.metadata,
        customTags: updatedTags,
      },
    };
    onUpdateTag(updatedImage);
  };

  return (
    <div style={{ marginTop: '0.5rem', fontFamily: 'sans-serif' }}>
      <strong>[custom]</strong>
      <EditableTagList tags={customTags} onChange={handleChange} />
    </div>
  );
}