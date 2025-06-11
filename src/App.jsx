// File: src/App.jsx
import React, { useState, useEffect } from 'react';
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
  const { artistGallery } = useCuration();
  const [error, setError] = useState(null);

  const navBtnStyle = {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: '#f3f4f6',
    color: '#1e3a8a',
    cursor: 'pointer',
    flex: '1 1 auto',
    minWidth: '150px',
  };

  return (
    <div className="App" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
          {view === 'curatedFinal' && <CuratedGalleryFinal />}
          {view === 'curated' && <YourCuration />}
          {view === 'client' && <ArtClientLanding setView={setView} />}
        </ErrorCatcher>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('landing');

  useEffect(() => {
    localStorage.removeItem('yourcuration_view');
  }, []);

  return (
    <YourCurationProvider>
      <InnerApp view={view} setView={setView} />
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