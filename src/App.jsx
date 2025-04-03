import React, { useState } from 'react';
import ArtClientLanding from './ArtClientLanding';
import ArtistDashboard from './ArtistDashboard';
import SampleRater from './SampleRater';
import CuratedGallery from './CuratedGallery';
import SkinWrapper from './SkinWrapper';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  const [page, setPage] = useState('client');
  const [userRatings, setUserRatings] = useState([]);

  const handleRatingsComplete = (ratings) => {
    setUserRatings(ratings);
    setPage('gallery');
  };

  return (
    <>
      {['client', 'viewer', 'gallery'].includes(page) ? (
        <SkinWrapper>
          <nav className="p-4 bg-muted flex gap-4 shadow-sm border-b z-30 relative">
            <button onClick={() => setPage('artist')} className="text-sm font-medium hover:underline">
              Artist Dashboard
            </button>
            <button onClick={() => setPage('viewer')} className="text-sm font-medium hover:underline">
              Viewer
            </button>
            <button onClick={() => setPage('gallery')} className="text-sm font-medium hover:underline">
              Curated Gallery
            </button>
          </nav>

          <main className="p-6">
            <AnimatePresence mode="wait">
              {page === 'client' && (
                <ArtClientLanding key="client" onStart={() => setPage('viewer')} />
              )}
              {page === 'viewer' && (
                <SampleRater key="viewer" onComplete={handleRatingsComplete} />
              )}
              {page === 'gallery' && (
                <CuratedGallery key="gallery" ratings={userRatings} />
              )}
            </AnimatePresence>
          </main>
        </SkinWrapper>
      ) : (
        <>
          <nav className="p-4 bg-muted flex gap-4 shadow-sm border-b">
            <button onClick={() => setPage('artist')} className="text-sm font-medium hover:underline">
              Artist Dashboard
            </button>
            <button onClick={() => setPage('viewer')} className="text-sm font-medium hover:underline">
              Viewer
            </button>
            <button onClick={() => setPage('gallery')} className="text-sm font-medium hover:underline">
              Curated Gallery
            </button>
          </nav>

          <main className="p-6">
            <AnimatePresence mode="wait">
              {page === 'artist' && <ArtistDashboard key="artist" />}
            </AnimatePresence>
          </main>
        </>
      )}
    </>
  );
}