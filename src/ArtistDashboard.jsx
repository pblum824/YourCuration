// File: src/ArtistDashboard.jsx
import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import { compressImage } from './utils/imageHelpers';
import { saveBlob } from './utils/dbCache';
import GalleryControls from './GalleryControls';
import HeroSection from './HeroSection';
import GalleryGrid from './GalleryGrid';
import DevToggle from './DevToggle';
import MultiFilePicker from './MultiFilePicker';
import UploadWarnings from './UploadWarnings';
import DragDropUpload from './DragDropUpload';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ArtistDashboard({ setView }) {
  const { artistGallery, setArtistGallery } = useCuration();

  const [heroImage, setHeroImage] = useState(null);
  const [borderSkin, setBorderSkin] = useState(null);
  const [centerBackground, setCenterBackground] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadWarnings, setUploadWarnings] = useState([]);
  const [devMode, setDevMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [sampleWarningId, setSampleWarningId] = useState(null);
  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  const isValidImage = (img) => img?.id && img?.url && img?.name;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const valid = files.filter((file) => file.type && ACCEPTED_FORMATS.includes(file.type));
    setUploadWarnings(files.filter((f) => !valid.includes(f)).map((f) => `${f.name} skipped.`));
    setUploadCount((prev) => prev + valid.length);

    const newImages = [];

    for (const file of valid) {
      const compressed = await compressImage(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(compressed);

      await saveBlob(id, compressed);
      logToScreen(`🧠 Saved to IndexedDB: ${id}`);

      newImages.push({
        id,
        name: file.name,
        url,
        scrapeEligible: true,
        metadata: {},
        galleryEligible: true,
        sampleEligible: false,
        localRefId: id,
      });
    }

    setArtistGallery((prev) => [...prev, ...newImages]);
  };

  const handleSingleUpload = async (e, setter) => {
    const file = e.target.files[0];
    if (!file || !file.type || !ACCEPTED_FORMATS.includes(file.type)) return;
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    setter({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url,
      scrapeEligible: true,
      metadata: {},
    });
  };

  const toggleImageSample = (id) => {
    const sampleCount = artistGallery.filter((img) => img.sampleEligible).length;
    const isTargetSample = artistGallery.find((img) => img.id === id)?.sampleEligible;

    if (isTargetSample || sampleCount < 15) {
      setArtistGallery((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, sampleEligible: !img.sampleEligible } : img
        )
      );
      setSampleWarningId(null);
    } else {
      setSampleWarningId(id);
    }
  };

  const toggleImageGallery = (id) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img
      )
    );

  const toggleImageScrape = (id) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );

  const removeImage = (id) => {
    setArtistGallery((prev) => prev.filter((img) => img.id !== id));
    setUploadCount((prev) => Math.max(0, prev - 1));
  };

  const viewGallery = artistGallery.map((img) => ({
    id: img.id,
    name: img.name,
    url: img.url,
    sampleEligible: img.sampleEligible,
    galleryEligible: img.galleryEligible,
    scrapeEligible: img.scrapeEligible,
    metadata: img.metadata,
  }));

  return (
    <div style={{ padding: '2rem' }}>
      <DevToggle devMode={devMode} setDevMode={setDevMode} />
      <h2
        style={{
          fontSize: '2.25rem',
          fontFamily: 'Parisienne, cursive',
          color: '#1e3a8a',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        Artist Dashboard
      </h2>

      <GalleryControls
        onExport={() => setView('generate')}
        onImport={() => {}}
        onGenerate={() => setView('generate')}
        onReset={() => {
          if (!window.confirm('Are you sure you want to reset your entire dashboard? This will remove all uploads and settings.')) return;
          setHeroImage(null);
          setBorderSkin(null);
          setCenterBackground(null);
          setArtistGallery([]);
          setUploadCount(0);
          setUploadWarnings([]);
        }}
      />

      <HeroSection label="Hero Image" imageState={heroImage} setImageState={setHeroImage} handleSingleUpload={handleSingleUpload} />
      <HeroSection label="Border Skin" imageState={borderSkin} setImageState={setBorderSkin} handleSingleUpload={handleSingleUpload} />
      <HeroSection label="Center Background" imageState={centerBackground} setImageState={setCenterBackground} handleSingleUpload={handleSingleUpload} />

      <UploadWarnings warnings={uploadWarnings} />
      <DragDropUpload dragging={dragging} setDragging={setDragging} handleFiles={handleFiles} />
      <MultiFilePicker onChange={(files) => handleFiles(files)} uploadCount={uploadCount} acceptedFormats={ACCEPTED_FORMATS} />

      <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>
        Debug: artistGallery length = {artistGallery.length}
      </p>
      <div style={{ fontFamily: 'monospace', color: '#555', marginTop: '2rem' }}>
        {logs.map((log, i) => (
          <div key={i}>📦 {log}</div>
        ))}
      </div>

      <GalleryGrid
        images={viewGallery.filter(isValidImage)}
        onToggleScrape={toggleImageScrape}
        onRemove={removeImage}
        onToggleGallery={toggleImageGallery}
        onToggleSample={toggleImageSample}
        devMode={devMode}
        sampleWarningId={sampleWarningId}
      />
    </div>
  );
}