// File: src/components/EditableTagSection.jsx
import React from 'react';
import EditableTagList from './EditableTagList';

export default function EditableTagSection({ image, onUpdateTag }) {
  const customTags = image.metadata?.customTags || [];

  const handleChange = (updatedTags) => {
    // Fix: pass ID, field name, and new values to match onUpdateTag expected signature
    onUpdateTag(image.id, 'customTags', updatedTags);
  };

  return (
    <div style={{ marginTop: '0.5rem', fontFamily: 'sans-serif' }}>
      <strong>[custom]</strong>
      <EditableTagList tags={customTags} onChange={handleChange} />
    </div>
  );
}