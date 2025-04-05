import React, { useState } from 'react';
import ArtClientLanding from './ArtClientLanding';
import ArtistDashboard from './ArtistDashboard';
import SampleRater from './SampleRater';
import CuratedGallery from './CuratedGallery';
import SkinWrapper from './SkinWrapper';
import loadReadyBundle from './utils/loadReadyBundle';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  const bundle = loadReadyBundle();

  const [page, setPage] = useState('client');
  const [userRatings, setUserRatings] = useState([]);

  // Restore ready bundle state if present
  const [heroImage, setHeroImage] = useState(bundle?.heroImage || null);
  const [borderSkin, setBorderSkin] = useState(bundle?.borderSkin || null);
  const [centerBackground, setCenterBackground] = useState(bundle?.centerBackground || null);
  const [artistImages, setArtistImages] = useState(bundle?.images || []);
  const [clientSessions, setClientSessions] = useState(bundle?.clientSessions || []);

  const handleRatingsComplete = (ratings) => {
    setUserRatings(ratings);
    setPage('gallery');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVIGATION - floating buttons only */}
      <nav style={{
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1.25rem',
        position: 'relative',
        zIndex: 50,
      }}>
        <button onClick={() => setPage('artist')} style={navButton}>
          Artist Dashboard
        </button>
        <button onClick={() => setPage('viewer')} style={navButton}>
          Viewer
        </button>
        <button onClick={() => setPage('gallery')} style={navButton}>
          Curated Gallery
        </button>
      </nav>

      <main style={{ padding: '1.5rem' }}>
        <AnimatePresence mode="wait">
          <>
            {page === 'client' && (
              <SkinWrapper>
                <ArtClientLanding key="client" onStart={() => setPage('viewer')} />
              </SkinWrapper>
            )}
            {page === 'artist' && (
              <ArtistDashboard
                key="artist"
                heroImage={heroImage}
                borderSkin={borderSkin}
                centerBackground={centerBackground}
                artistImages={artistImages}
                clientSessions={clientSessions}
              />
            )}
            {page === 'viewer' && (
              <SkinWrapper>
                <SampleRater key="viewer" onComplete={handleRatingsComplete} />
              </SkinWrapper>
            )}
            {page === 'gallery' && (
              <SkinWrapper>
                <CuratedGallery
                  key="gallery"
                  lovedSamples={userRatings.filter(r => r.score === 3)}
                  dislikedSamples={userRatings.filter(r => r.score === 1)}
                />
              </SkinWrapper>
            )}
          </>
        </AnimatePresence>
      </main>
    </div>
  );
}

const navButton = {
  fontSize: '1.5rem',
  padding: '0.75rem 1.5rem',
  borderRadius: '0.5rem',
  fontFamily: 'Parisienne, cursive',
  backgroundColor: 'white',
  color: '#1e3a8a',
  border: '1px solid #ccc',
  cursor: 'pointer',
  transition: '0.2s ease-in-out',
  boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
};