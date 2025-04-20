import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import MetadataBuilder from './MetadataBuilder';
import GenerateTags from './GenerateTags';

export default function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('yourcuration_view') || 'artist';
  });

  const [error, setError] = useState(null);

  const toggleView = () => {
    let next;
    if (view === 'artist') next = 'meta';
    else if (view === 'meta') next = 'generate';
    else next = 'artist';

    setView(next);
    localStorage.setItem('yourcuration_view', next);
  };

  return (
    <div className="App" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#def', padding: '0.5rem', marginBottom: '1rem' }}>
        <strong>App Loaded:</strong> view = {view}
      </div>

      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button onClick={toggleView} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          {view === 'artist' ? 'Switch to MetadataBuilder' :
           view === 'meta' ? 'Switch to GenerateTags' :
           'Switch to ArtistDashboard'}
        </button>
      </div>

      {error ? (
        <div style={{ color: 'red', background: '#fee', padding: '1rem', borderRadius: '0.5rem' }}>
          <strong>Runtime Error:</strong>
          <pre>{error.toString()}</pre>
        </div>
      ) : (
        <ErrorCatcher onError={setError}>
          {view === 'artist' && <ArtistDashboard setView={setView} />}
          {view === 'generate' && <GenerateTags setView={setView} />}
          {view === 'meta' && <MetadataBuilder setView={setView} />}
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