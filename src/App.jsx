// App.jsx — Toggle between ArtistDashboard and MetadataBuilder

import React, { useState } from 'react';
import ArtistDashboard from './ArtistDashboard';
import MetadataBuilder from './MetadataBuilder';

export default function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('yourcuration_view') || 'artist';
  });

  const toggleView = () => {
    const next = view === 'artist' ? 'meta' : 'artist';
    setView(next);
    localStorage.setItem('yourcuration_view', next);
  };

  return (
    <div className="App" style={{ padding: '1rem' }}>
      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button onClick={toggleView} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          {view === 'artist' ? 'Switch to MetadataBuilder' : 'Switch to ArtistDashboard'}
        </button>
      </div>
      {view === 'artist' ? <ArtistDashboard /> : <MetadataBuilder />}
    </div>
  );
}