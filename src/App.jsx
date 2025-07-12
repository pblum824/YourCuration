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
import { FontSettingsProvider, useFontSettings } from './FontSettingsContext';
import { getFontStyle } from './utils/fontUtils';
import { setImageStorageMode } from './utils/imageStore';

function InnerApp({ view, setView }) {
  const { artistGallery, mode, switchToClientMode, switchToArtistMode } = useCuration();
  const { selectedFont } = useFontSettings();
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

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

  useEffect(() => {
    const handleKey = (e) => {
      if (view === 'client' && e.shiftKey && e.key.toLowerCase() === 'a') {
        switchToArtistMode();
        setPreviewMode(false);
        setView('artist');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, setView, switchToArtistMode]);

  const goToClient = () => {
    switchToClientMode();
    setPreviewMode(false);
    setView('client');
  };

  const enterPreview = () => {
    setPreviewMode(true);
    setView('rate');
  };

  const exitPreview = () => {
    switchToArtistMode();
    setPreviewMode(false);
    setView('artist');
  };

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
          {view === 'landing' && (
            <LandingPage
              setView={setView}
              onClientClick={goToClient}
              onArtistClick={() => {
                switchToArtistMode();
                setView('artist');
              }}
            />
          )}

          {view === 'artist' && (
            <ArtistDashboard setView={setView} onPreviewClient={enterPreview} />
          )}

          {view === 'generate' && <GenerateTags setView={setView} />}

          {view === 'rate' && (
            <SampleRater
              images={artistGallery.filter((img) => img.sampleEligible)}
              setView={setView}
              previewMode={previewMode}
            />
          )}

          {view === 'curated1' && (
            <CuratedGallery1
              setView={setView}
              onReturn={previewMode ? exitPreview : null}
            />
          )}

          {view === 'curated2' && (
            <CuratedGallery2
              setView={setView}
              onReturn={previewMode ? exitPreview : null}
            />
          )}

          {view === 'curatedFinal' && (
            <CuratedGalleryFinal
              setView={setView}
              onReturn={previewMode ? exitPreview : null}
            />
          )}

          {view === 'curated' && <YourCuration setView={setView} />}

          {view === 'client' && (
            <SampleRater
              previewMode={false}
              setView={setView}
              images={artistGallery.filter((img) => img.sampleEligible)}
            />
          )}
        </ErrorCatcher>
      )}
    </div>
  );
}

function ErrorCatcher({ onError, children }) {
  try {
    return children;
  } catch (err) {
    onError(err);
    return null;
  }
}

export default function App() {
  const [view, setView] = useState('landing');

  return (
    <DevModeProvider>
      <FontSettingsProvider>
        <YourCurationProvider>
          <InnerApp view={view} setView={setView} />
        </YourCurationProvider>
      </FontSettingsProvider>
    </DevModeProvider>
  );
}