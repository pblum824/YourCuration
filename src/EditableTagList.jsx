// File: src/EditableTagList.jsx
import React, { useState } from 'react';

export default function EditableTagList({ tags, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInputValue('');
  };

  const handleRemove = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            background: '#e0e7ff',
            color: '#1e3a8a',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {tag}
          <button
            onClick={() => handleRemove(tag)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#991b1b',
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Add tag"
        style={{
          padding: '0.5rem',
          fontSize: '0.85rem',
          border: '1px solid #ccc',
          borderRadius: '0.5rem',
          fontFamily: 'sans-serif',
          minWidth: '80px',
        }}
      />
    </div>
  );
}