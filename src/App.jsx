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
  const navBtnStyle = {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: '#f3f4f6',
    color: '#1e3a8a',
    cursor: 'pointer',
    flex: '1 1 auto',
    minWidth: '150px'
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setView('artist')} style={navBtnStyle}>🎨 Artist Dashboard</button>
        <button onClick={() => setView('generate')} style={navBtnStyle}>🛠️ Generate Tags</button>
        <button onClick={() => setView('rate')} style={navBtnStyle}>🧪 Sample Rater</button>
        <button onClick={() => setView('curated1')} style={navBtnStyle}>🖼️ Gallery 1</button>
        <button onClick={() => setView('curated2')} style={navBtnStyle}>🔍 Gallery 2</button>
        <button onClick={() => setView('curatedFinal')} style={navBtnStyle}>🏁 Final Gallery</button>
      </div>
      {error ? (
        <div style={{ color: 'red', background: '#fee', padding: '1rem', borderRadius: '0.5rem' }}>
          <strong>Runtime Error:</strong>
          <pre>{error.toString()}</pre>
        </div>
      ) : (
        <ErrorCatcher onError={setError}>
          {/* Uncomment views as needed */}
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