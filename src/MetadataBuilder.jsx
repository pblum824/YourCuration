import React, { useState } from 'react';
import generateMetadata from './utils/generateMetadata';

export default function MetadataBuilder() {
  const [filename, setFilename] = useState('sunset_dog.jpg');
  const [metadata, setMetadata] = useState(generateMetadata('sunset_dog.jpg'));

  const handleChange = (e) => {
    const name = e.target.value;
    setFilename(name);
    setMetadata(generateMetadata(name));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Metadata Builder</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>Simulated Filename:</label>
        <input
          type="text"
          value={filename}
          onChange={handleChange}
          style={{
            marginLeft: '1rem',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            width: '300px'
          }}
        />
      </div>

      <h4>Generated Tags:</h4>
      <div style={{ background: '#eef', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        {metadata.tags.length > 0 ? metadata.tags.join(', ') : <em>No tags detected</em>}
      </div>

      <h4>Dimensions Breakdown:</h4>
      <pre style={{
        background: '#f9f9f9',
        padding: '1rem',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        overflowX: 'auto'
      }}>
        {JSON.stringify(metadata.dimensions, null, 2)}
      </pre>
    </div>
  );
}