import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import MetadataBuilder from './MetadataBuilder';

export default function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('yourcuration_view') || 'artist';
  });

  const [error, setError] = useState(null);

  const toggleView = () => {
    const next = view === 'artist' ? 'meta' : 'artist';
    setView(next);
    localStorage.setItem('yourcuration_view', next);
  };

  return (
    <div className="App" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button onClick={toggleView} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          {view === 'artist' ? 'Switch to MetadataBuilder' : 'Switch to ArtistDashboard'}
        </button>
      </div>

      {error ? (
        <div style={{ color: 'red', background: '#fee', padding: '1rem', borderRadius: '0.5rem' }}>
          <strong>Runtime Error:</strong>
          <pre>{error.toString()}</pre>
        </div>
      ) : (
        <ErrorCatcher onError={setError}>
          {view === 'artist' ? <ArtistDashboard /> : <MetadataBuilder />}
        </ErrorCatcher>
      )}
    </div>
  );
}

function ErrorCatcher({ children, onError }) {
  try {
    return children;
  } catch (err) {
    onError(err);
    return null;
  }
}