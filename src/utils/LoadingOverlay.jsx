// File: src/utils/LoadingOverlay.jsx
import React from 'react';

export default function LoadingOverlay({ visible, progress = null, onCancel }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{ width: '300px', backgroundColor: '#fff', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Processing...</p>
        <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div
            style={{
              width: progress !== null ? `${progress}%` : '100%',
              height: '100%',
              backgroundColor: '#1e3a8a',
              transition: 'width 0.3s ease',
            }}
          ></div>
        </div>
        <button
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            backgroundColor: '#b91c1c',
            color: '#fff',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}