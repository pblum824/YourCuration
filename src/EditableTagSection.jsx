// File: src/EditableTagSection.jsx
import React from 'react';
import EditableTagList from './EditableTagList';

export default function EditableTagSection({ image, onUpdateTag }) {
  const tags = image.metadata?.userTags || [];

  const updateTags = (newTags) => {
    const newMeta = {
      ...image.metadata,
      userTags: newTags
    };
    onUpdateTag(image.id, newMeta);
  };

  return (
    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
      <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>✏️ Tags (editable) — click ✕ to remove, or type to add</p>
      <EditableTagList tags={tags} onChange={updateTags} />
    </div>
  );
}