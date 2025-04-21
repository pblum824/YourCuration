// GenerateTextTags.jsx (stub)
import React from 'react';

export default function GenerateTextTags({ setView }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>Generate Text Tags</h2>
      <p style={{ fontStyle: 'italic', marginTop: '2rem', color: '#666' }}>
        Text tagging is disabled for now while we test the image model.
      </p>
      <button
        onClick={() => setView('artist')}
        style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#e0f2fe', color: '#075985', cursor: 'pointer' }}
      >
        Return to Artist Dashboard
      </button>
    </div>
  );
}
