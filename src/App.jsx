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

function InnerApp({ view, setView }) {
  const { artistGallery } = useCuration();
  const [error, setError] = useState(null);

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

      {error ? (
        <div style={{ color: 'red', background: '#fee', padding: '1rem', borderRadius: '0.5rem' }}>
          <strong>Runtime Error:</strong>
          <pre>{error.toString()}</pre>
        </div>
      ) : (
        <ErrorCatcher onError={setError}>
          {/* Uncomment ONE at a time to isolate issues */}

          {/* <div>Static content works</div> */}
          {/* <ArtClientLanding /> */}
          {/* <ArtistDashboard setView={setView} /> */}
          {/* <GenerateTags setView={setView} /> */}
          {/* <SampleRater images={artistGallery.filter((img) => img.sampleEligible)} /> */}
          {/* <CuratedGallery1 /> */}
          {/* <CuratedGallery2 /> */}
          {/* <CuratedGalleryFinal /> */}
          {/* <YourCuration /> */}
        </ErrorCatcher>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('landing');

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