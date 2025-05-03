import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import GenerateTags from './GenerateTags';
import SampleRater from './SampleRater';
import { YourCurationProvider } from './YourCurationContext';
import ArtClientLanding from './ArtClientLanding';

export default function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('yourcuration_view') || 'landing';
  });

  const [error, setError] = useState(null);

  const toggleView = () => {
    let next;
    if (view === 'landing') next = 'artist';
    else if (view === 'artist') next = 'generate';
    else if (view === 'generate') next = 'rate';
    else next = 'landing';

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
            {view === 'landing' ? 'Enter Artist Dashboard' :
             view === 'artist' ? 'Go to Generate Tags' :
             view === 'generate' ? 'Rate Samples' :
             'Back to Welcome'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('yourcuration_view');
              setView('landing');
            }}
            style={{
              fontSize: '0.9rem',
              backgroundColor: '#e0e7ff',
              color: '#1e3a8a',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #c7d2fe',
              marginLeft: '1rem',
              cursor: 'pointer',
            }}
          >
            Switch to Client View
          </button>
        </div>

        {error ? (
          <div style={{ color: 'red', background: '#fee', padding: '1rem', borderRadius: '0.5rem' }}>
            <strong>Runtime Error:</strong>
            <pre>{error.toString()}</pre>
          </div>
        ) : (
          <ErrorCatcher onError={setError}>
            {view === 'landing' && <ArtClientLanding setView={setView} />}
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