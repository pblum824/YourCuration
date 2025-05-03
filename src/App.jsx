import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import GenerateTags from './GenerateTags';
import SampleRater from './SampleRater';
import { YourCurationProvider } from './YourCurationContext';

export default function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('yourcuration_view') || 'artist';
  });

  const [error, setError] = useState(null);

  const toggleView = () => {
    let next;
    if (view === 'artist') next = 'generate';
    else if (view === 'generate') next = 'rate';
    else next = 'artist';

    setView(next);
    localStorage.setItem('yourcuration_view', next);
  };

  return (
    <YourCurationProvider>
      <div className="App" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#def', padding: '0.5rem', marginBottom: '1rem' }}>
          <strong>App Loaded:</strong> view = {view}
        </div>

        <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
          <button onClick={toggleView} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            {view === 'artist' ? 'Switch to Generate Tags' :
             view === 'generate' ? 'Switch to Sample Rater' :
             'Switch to Artist Dashboard'}
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
            {view === 'rate' && <SampleRater />}
          </ErrorCatcher>
        )}
      </div>
    </YourCurationProvider>
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