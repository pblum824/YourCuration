// File: src/utils/LoadingOverlay.jsx
import React, { useEffect, useState } from 'react';

export default function LoadingOverlay({ duration = 120000, onCancel }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame;
    let start;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setProgress(percentage);
      if (percentage < 100) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          width: '300px',
        }}
      >
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Processing automated metadata tags...</p>
        <div
          style={{
            height: '12px',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#1e3a8a',
              transition: 'width 0.2s ease-in-out',
            }}
          />
        </div>
        <button
          onClick={onCancel}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #b91c1c',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}