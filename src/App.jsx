import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import SampleRater from './SampleRater';
import CuratedGallery from './CuratedGallery';

export default function App() {
  const [page, setPage] = useState('artist');
  const [userRatings, setUserRatings] = useState([]);

  const handleRatingsComplete = (ratings) => {
    setUserRatings(ratings);
    setPage('gallery');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
        {page === 'artist' && <ArtistDashboard />}
        {page === 'viewer' && <SampleRater onComplete={handleRatingsComplete} />}
        {page === 'gallery' && <CuratedGallery ratings={userRatings} />}
      </main>
    </div>
  );
}