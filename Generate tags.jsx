// GenerateTags.jsx (stub for isolated ONNX tag generation page)
import React, { useState, useEffect } from 'react';

export default function GenerateTags() {
  const [images, setImages] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);

  // Simulate loading delay for ONNX model (e.g. 2 minutes or less)
  useEffect(() => {
    // Pull previously uploaded images from localStorage or context
    const stored = localStorage.getItem('yourcuration_artistImages');
    if (stored) setImages(JSON.parse(stored));

    // Fake progress bar timer (will be replaced with real ONNX load logic)
    const timer = setTimeout(() => {
      setModelsLoaded(true);
      setShowGenerateButton(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>Generate Tags</h2>

      {!modelsLoaded && (
        <div>
          <p style={{ fontStyle: 'italic', color: '#666' }}>Loading large tag generator database, please be patient...</p>
          <div style={{ width: '80%', margin: '1rem auto', background: '#eee', borderRadius: '1rem', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '1rem', background: '#1e3a8a', animation: 'pulse 2s infinite' }}></div>
          </div>
        </div>
      )}

      {showGenerateButton && (
        <button style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#1e3a8a', color: 'white', cursor: 'pointer' }}>
          Generate MetaTags
        </button>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '240px' }}>
            <img src={img.url} alt={img.name} style={{ width: '100%', borderRadius: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

