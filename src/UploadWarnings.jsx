import React from 'react';

export default function UploadWarnings({ warnings }) {
  if (!warnings.length) return null;

  return (
    <div style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '1rem' }}>
      <p>Some files were not added:</p>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {warnings.map((warn, i) => (
          <li key={i} style={{ fontSize: '0.9rem' }}>{warn}</li>
        ))}
      </ul>
    </div>
  );
}