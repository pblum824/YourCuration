// File: src/App.jsx
import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import GenerateTags from './GenerateTags';
import SampleRater from './SampleRater';
import CuratedGallery1 from './CuratedGallery1';
import CuratedGallery2 from './CuratedGallery2';
import CuratedGalleryFinal from './CuratedGalleryFinal';
import { YourCurationProvider, useCuration } from './YourCurationContext';
import ArtClientLanding from './ArtClientLanding';
import YourCuration from './YourCuration';
import LandingPage from './LandingPage';
import { DevModeProvider } from './context/DevModeContext';

const validViews = [
  'landing',
  'artist',
  'generate',
  'rate',
  'curated1',
  'curated2',
  'curatedFinal',
  'curated',
  'client'
];

function InnerApp({ view, setView }) {
  const { artistGallery, mode } = useCuration();
  const [error, setError] = useState(null);

  const navBtnStyle = {
    padding: '0.35rem 0.5rem',    // reduced vertical and horizontal padding
    fontSize: '0.85rem',           // slightly smaller text
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: '#f3f4f6',
    color: '#1e3a8a',
    cursor: 'pointer',
    flex: '0 1 auto',              // don’t expand too much
    minWidth: '120px',             // give room to tighten layout
    lineHeight: '1.2',             // ensures no vertical stretching
  };

  return (
    <div className="App" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      {mode === 'artist' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0rem' }}>
          {[
            { key: 'artist', label: '🎨 Artist Dashboard' },
            { key: 'generate', label: '🛠️ Generate Tags' },
            { key: 'rate', label: '🧪 Sample Rater' },
            { key: 'curated1', label: '🖼️ Gallery 1' },
            { key: 'curated2', label: '🔍 Gallery 2' },
            { key: 'curatedFinal', label: '🏁 Final Gallery' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                ...navBtnStyle,
                backgroundColor: view === key ? '#ede9fe' : '#f3f4f6',
                color: view === key ? '#5b21b6' : '#1e3a8a',
                border: '1px solid #1e3a8a',
                fontWeight: view === key ? 'bold' : 'normal',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <div style={{ color: 'red', background: '#fee', padding: '1rem', borderRadius: '0.5rem' }}>
          <strong>Runtime Error:</strong>
          <pre>{error.toString()}</pre>
        </div>
      ) : (
        <ErrorCatcher onError={setError}>
          {view === 'landing' && <LandingPage setView={setView} />}
          {view === 'artist' && <ArtistDashboard setView={setView} />}
          {view === 'generate' && <GenerateTags setView={setView} />}
          {view === 'rate' && <SampleRater images={artistGallery.filter((img) => img.sampleEligible)} setView={setView} />}
          {view === 'curated1' && <CuratedGallery1 setView={setView} />}
          {view === 'curated2' && <CuratedGallery2 setView={setView} />}
          {view === 'curatedFinal' && <CuratedGalleryFinal setView={setView} />}
          {view === 'curated' && <YourCuration setView={setView} />}
          {view === 'client' && <ArtClientLanding setView={setView} />}
        </ErrorCatcher>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('landing');

  return (
    <DevModeProvider>
      <YourCurationProvider>
        <InnerApp view={view} setView={setView} />
      </YourCurationProvider>
    </DevModeProvider>
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