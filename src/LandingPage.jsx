// File: src/LandingPage.jsx
import React from 'react';

export default function LandingPage({ setView }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'Parisienne, cursive', color: '#1e3a8a', marginBottom: '1.5rem' }}>
        Welcome to YourCuration
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px' }}>
        YourCuration connects artists with art clients through curated, beautiful, and deeply intentional image selection. Who are you?
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => setView('artist')}
          style={buttonStyle('#1e3a8a', '#fff')}
        >
          I’m an Artist
        </button>
        <button
          onClick={() => setView('client')}
          style={buttonStyle('#f97316', '#fff')}
        >
          I’m an Art Client
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
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
  };
}