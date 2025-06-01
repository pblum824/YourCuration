// File: src/EditableTagSection.jsx
import React, { useState, useEffect } from 'react';
import EditableTagList from './EditableTagList';
import { useCuration } from './YourCurationContext';

export default function EditableTagSection({ imageId, initialTags }) {
  const [localTags, setLocalTags] = useState(initialTags || []);
  const [saved, setSaved] = useState(false);
  const { updateImageMetadata } = useCuration();

  const handleTagChange = (newTags) => {
    setLocalTags(newTags);
    updateImageMetadata(imageId, { imageTags: newTags });
    setSaved(true);
  };

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>
        🖋️ Tags (editable) — click × to remove, or type to add
      </p>
      <EditableTagList tags={localTags} onChange={handleTagChange} />
      {saved && (
        <p style={{ color: 'green', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          ✅ Tags saved
        </p>
      )}
    </div>
  );
}