import React, { useState } from 'react';

export default function MetadataBuilder() {
  const [mode, setMode] = useState('');
  const [tags, setTags] = useState([]);

  const sampleImage = {
    name: 'SampleImage.jpg',
    url: 'https://via.placeholder.com/600x400?text=Sample+Image'
  };

  const handleModeSelect = (selected) => {
    setMode(selected);

    if (selected === 'auto') {
      setTags(['romantic', 'backlit', 'soft-focus']);
    } else if (selected === 'standard') {
      setTags(['landscape', 'rule-of-thirds']);
    } else if (selected === 'objective') {
      setTags(['ISO 400', 'f/2.8', '35mm', 'shot at dusk']);
    } else {
      setTags([]);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Metadata Builder</h2>

      <img
        src={sampleImage.url}
        alt={sampleImage.name}
        style={{ width: '100%', maxWidth: '600px', borderRadius: '0.5rem', marginBottom: '1rem' }}
      />

      <h3>Select Metadata Mode</h3>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => handleModeSelect('custom')} style={buttonStyle}>1. I'll use my own descriptors</button>{' '}
        <button onClick={() => handleModeSelect('standard')} style={buttonStyle}>2. Use standard descriptors</button>{' '}
        <button onClick={() => handleModeSelect('objective')} style={buttonStyle}>3. Use objective image data</button>{' '}
        <button onClick={() => handleModeSelect('auto')} style={buttonStyle}>4. You decide</button>
      </div>

      <h4>Current Mode: <span style={{ fontWeight: 500 }}>{mode || 'none selected'}</span></h4>

      <h4>Tags Preview:</h4>
      <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem' }}>
        {tags.length > 0 ? tags.join(', ') : <em>No tags yet</em>}
      </div>
    </div>
  );
}

const buttonStyle = {
  margin: '0.25rem',
  padding: '0.5rem 1rem',
  fontSize: '0.95rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  color: '#1e3a8a',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
};