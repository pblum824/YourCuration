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
import { DevModeProvider } from './context/DevModeContext';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';
import { setImageStorageMode } from './utils/imageStore';

function InnerApp({ view, setView }) {
  const { artistGallery, mode } = useCuration();
  const { selectedFont } = useFontSettings();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const bundle = JSON.parse(localStorage.getItem('yourcuration_readyBundle'));
      if (bundle?.strategy) {
        setImageStorageMode(bundle.strategy);
      }
    } catch (err) {
      console.warn('Could not apply storage strategy from bundle:', err);
    }
  }, []);

  return (
    <div
      className="App"
      style={{ padding: '0.3rem 1rem 1rem', ...getFontStyle(mode, { selectedFont }) }}
    >
      {error ? (
        <div
          style={{
            color: 'red',
            background: '#fee',
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          <strong>Runtime Error:</strong>
          <pre>{error.toString()}</pre>
        </div>
      ) : (
        <ErrorCatcher onError={setError}>
          {view === 'landing' && <LandingPage setView={setView} />}
          {view === 'artist' && <ArtistDashboard setView={setView} />}
          {view === 'generate' && <GenerateTags setView={setView} />}
          {view === 'rate' && (
            <SampleRater
              images={artistGallery.filter((img) => img.sampleEligible)}
              setView={setView}
            />
          )}
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