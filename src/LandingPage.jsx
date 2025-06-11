// File: src/LandingPage.jsx
import React, { useState, useEffect } from 'react';

export default function LandingPage({ setView }) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      style={{
        height: `${viewport.height}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1rem',
        textAlign: 'center'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'Parisienne, cursive', color: '#1e3a8a', marginBottom: '1.5rem' }}>
        Welcome to YourCuration
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px' }}>
        YourCuration connects artists with art clients through curated, beautiful, and deeply intentional image selection.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => setView('artist')}
          style={buttonStyle('#1e3a8a', '#fff')}
        >
          Artist
        </button>
        <button
          onClick={() => setView('client')}
          style={buttonStyle('#10b981', '#fff')}
        >
          Client
        </button>
      </div>
    </div>
  );
}

function buttonStyle(bg, color) {
  return {
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    borderRadius: '0.75rem',
    backgroundColor: bg,
    color,
    border: 'none',
    cursor: 'pointer',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
  };
}