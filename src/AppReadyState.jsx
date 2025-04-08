import React, { useState, useEffect } from 'react';
import buildOfflineBundle from './utils/buildOfflineBundle';

export default function AppReadyState({
  heroImage,
  borderSkin,
  centerBackground,
  images,
  clientSessions
}) {
  const [isReady, setIsReady] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('yourcuration_ready');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsReady(parsed.ready);
      setLastUpdated(parsed.timestamp);
    }
  }, []);

  const handleToggle = () => {
    const newReady = !isReady;
    const timestamp = newReady ? new Date().toLocaleString() : null;

    setIsReady(newReady);
    setLastUpdated(timestamp);

    localStorage.setItem('yourcuration_ready', JSON.stringify({
      ready: newReady,
      timestamp,
    }));

    if (newReady) {
      buildOfflineBundle({
        heroImage,
        borderSkin,
        centerBackground,
        images,
        layoutChoice: 'grid', // placeholder for future support
        clientSessions,
      });
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontFamily: 'Parisienne, cursive',
        color: '#1e3a8a',
        marginBottom: '1rem'
      }}>
        Presentation Mode
      </h3>
      <button
        onClick={handleToggle}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1.25rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          backgroundColor: isReady ? '#d1fae5' : '#fee2e2',
          color: '#1e3a8a',
          cursor: 'pointer',
        }}
      >
        {isReady ? 'Ready to Present' : 'Not Ready'}
      </button>
      {lastUpdated && (
        <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}