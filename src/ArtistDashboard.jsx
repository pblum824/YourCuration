import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';

import HeroSection from './utils/HeroSection';
import GalleryControls from './utils/GalleryControls';
import GalleryDecor from './utils/GalleryDecor';
import GalleryUpload from './utils/GalleryUpload';
import DragDropUpload from './utils/DragDropUpload';
import MultiFilePicker from './utils/MultiFilePicker';
import GalleryGrid from './utils/GalleryGrid';

export default function ArtistDashboard({ setView }) {
  const {
    artistGallery,
    setArtistGallery,
    devMode,
    setDevMode,
    uploadWarnings,
    setUploadWarnings,
    uploadCount,
    setUploadCount,
    heroImage,
    setHeroImage,
    borderSkin,
    setBorderSkin,
    centerBackground,
    setCenterBackground,
  } = useCuration();

  const [dragging, setDragging] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button
          onClick={() => setDevMode(!devMode)}
          style={{ fontSize: '0.75rem', opacity: 0.5 }}
        >
          {devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
        </button>
      </div>

      <HeroSection
        heroImage={heroImage}
        setHeroImage={setHeroImage}
        borderSkin={borderSkin}
        setBorderSkin={setBorderSkin}
        centerBackground={centerBackground}
        setCenterBackground={setCenterBackground}
      />

      <GalleryControls setView={setView} />

      <GalleryDecor
        uploadWarnings={uploadWarnings}
        setUploadWarnings={setUploadWarnings}
      />

      <GalleryUpload
        uploadCount={uploadCount}
        setUploadCount={setUploadCount}
      />

      <DragDropUpload
        setDragging={setDragging}
        handleFiles={(files) => {
          const event = { dataTransfer: { files } };
          event.preventDefault = () => {};
          event.stopPropagation = () => {};
        }}
        dragging={dragging}
      />

      <MultiFilePicker
        handleFiles={(files) => {
          const event = { target: { files } };
          event.preventDefault = () => {};
          event.stopPropagation = () => {};
        }}
        uploadCount={uploadCount}
      />

      <GalleryGrid
        artistGallery={artistGallery}
        setArtistGallery={setArtistGallery}
        devMode={devMode}
      />
    </div>
  );
}