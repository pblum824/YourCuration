// ArtClientLanding.jsx — merged best-of-both versions
import React from 'react';

export default function ArtClientLanding({ setView }) {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        fontFamily: 'Parisienne, cursive',
        color: '#1e3a8a',
        gap: '2rem',
      }}
    >
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '1rem' }}>
          Your gallery starts here
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover which images speak to you — we’ll help curate your personal collection.
        </p>
      </div>
      <button
        onClick={() => setView('artist')}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          backgroundColor: '#1e3a8a',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          fontFamily: 'Parisienne, cursive',
        }}
      >
        Let’s do this!
      </button>
    </div>
  );
}
