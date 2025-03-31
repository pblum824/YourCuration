
import React, { useState } from 'react';
import PhotoSorter from './PhotoSorter';
import ArtistDashboard from './ArtistDashboard';

export default function App() {
  const [view, setView] = useState('sorter');
  return (
    <div>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1>YourCuration</h1>
        <div>
          <button onClick={() => setView('sorter')}>Viewer</button>
          <button onClick={() => setView('dashboard')}>Artist Dashboard</button>
        </div>
      </div>
      {view === 'sorter' ? <PhotoSorter /> : <ArtistDashboard />}
    </div>
  );
}
