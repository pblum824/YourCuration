import React from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';

export default function CuratedGallery1() {
  const { artistGallery = [], ratings = {} } = useCuration();

  let result = { strong: [], medium: [], weak: [] };
  let error = null;

  try {
    result = curateGallery1({ artistGallery, ratings });
  } catch (err) {
    error = err.message || 'curateGallery1 crashed';
  }

  const all = [...(result.strong || []), ...(result.medium || []), ...(result.weak || [])];

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#1e3a8a' }}>🧠 CG1 Debug Dump</h2>

      {error && (
        <div style={{ color: 'red' }}>❌ Error: {error}</div>
      )}

      {all.length === 0 && <p>No images returned from curation logic.</p>}

      {all.map((img, i) => (
        <pre
          key={img.id || i}
          style={{
            background: '#f9f9f9',
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {JSON.stringify(img, null, 2)}
        </pre>
      ))}
    </div>
  );
}