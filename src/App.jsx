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

const validViews = [
  'landing',
  'artist',
  'generate',
  'rate',
  'curated1',
  'curated2',
  'curatedFinal',
  'curated'
];

function InnerApp({ view, setView }) {
  const { artistGallery } = useCuration();
  const [error, setError] = useState(null);

  const toggleView = () => {
    let next;
    if (view === 'landing') next = 'artist';
    else if (view === 'artist') next = 'generate';
    else if (view === 'generate') next = 'rate';
    else if (view === 'rate') next = 'curated1';
    else if (view === 'curated1') next = 'curated2';
    else if (view === 'curated2') next = 'curatedFinal';
    else next = 'landing';

    setView(next);
    localStorage.setItem('yourcuration_view', next);
  };

  return (
    <div className="App" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fef3c7', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #facc15' }}>
        <strong>Debug Info:</strong><br />
        view: {view}<br />
        gallery: {Array.isArray(artistGallery) ? artistGallery.length : 'N/A'} images<br />
        samples: {artistGallery?.filter?.(img => img.sampleEligible).length || 0}
      </div>

      <div style={{ background: '#def', padding: '0.5rem', marginBottom: '1rem' }}>
        <strong>App Loaded:</strong> view = {view}
      </div>

      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button onClick={toggleView} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          {view === 'landing' ? 'Enter Artist Dashboard' :
           view === 'artist' ? 'Go to Generate Tags' :
           view === 'generate' ? 'Rate Samples' :
           view === 'rate' ? 'Curated Gallery 1' :
           view === 'curated1' ? 'Explore More (Gallery 2)' :
           view === 'curated2' ? 'Finalize Selection' :
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
          {view === 'rate' && <SampleRater images={artistGallery.filter((img) => img.sampleEligible)} />}
          {view === 'curated1' && <CuratedGallery1 />}
          {view === 'curated2' && <CuratedGallery2 />}
          {view === 'curatedFinal' && <CuratedGalleryFinal />}
          {view === 'curated' && <YourCuration />}
        </ErrorCatcher>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('yourcuration_view');
    const parsed = validViews.includes(saved) ? saved : 'landing';

    if (parsed === 'rate' || parsed.startsWith('curated')) {
      const storedGallery = JSON.parse(localStorage.getItem('artistGallery') || '[]');
      const hasSamples = storedGallery.some((img) => img.sampleEligible);
      return hasSamples ? parsed : 'artist';
    }

    return parsed;
  });

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