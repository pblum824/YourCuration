import React from 'react';

export default function ArtClientLanding({ onStart }) {
  return (
    <div
      className="min-h-[70vh] flex flex-col justify-center items-center text-center gap-8"
      style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}
    >
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Your gallery starts here
        </h1>
        <p style={{
          fontSize: '1.25rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Discover which images speak to you — we’ll help curate your personal collection.
        </p>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onStart}
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
      </div>
    </div>
  );
}