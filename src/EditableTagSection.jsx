// File: src/EditableTagSection.jsx
import React from 'react';
import EditableTagList from './EditableTagList';

export default function EditableTagSection({ image, onUpdateTag }) {
  const customTags = image.metadata?.customTags || [];

  const handleTagChange = (updatedTags) => {
    onUpdateTag(image.id, updatedTags);
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <strong>[custom]</strong>
      <EditableTagList tags={customTags} onChange={handleTagChange} />
    </div>
  );
}