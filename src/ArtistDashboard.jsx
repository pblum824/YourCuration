// File: src/ArtistDashboard.jsx
import React, { useState, useRef } from 'react';
import { useCuration } from './YourCurationContext';
import { compressImage } from './utils/imageHelpers';
import { saveBlob, loadBlob } from './utils/dbCache';
import { importGalleryData, exportGalleryData } from './utils/galleryIO';
import GalleryGrid from './GalleryGrid';
import HeroSection from './HeroSection';
import UploadWarnings from './UploadWarnings';
import DragDropUpload from './DragDropUpload';
import MultiFilePicker from './MultiFilePicker';
import ControlBar from './utils/ControlBar';
import LoadingOverlay from './utils/LoadingOverlay';
import { useDevMode } from './context/DevModeContext';
import { toggleSampleWithLimit } from './utils/sampleUtils';
import DuplicateUploadModal from './utils/DuplicateUploadModal';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ArtistDashboard({ setView }) {
  const { artistGallery, setArtistGallery } = useCuration();
  const { devMode, setDevMode } = useDevMode();

  const [heroImage, setHeroImage] = useState(null);
  const [borderSkin, setBorderSkin] = useState(null);
  const [centerBackground, setCenterBackground] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadWarnings, setUploadWarnings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sampleWarningId, setSampleWarningId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cancelUpload, setCancelUpload] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const fileInputRef = useRef(null);
  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);
  const isValidImage = (img) => img?.id && img?.url && img?.name;

  const handleImportGallery = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { heroImage, borderSkin, centerBackground, images } = await importGalleryData(file);
      if (heroImage) setHeroImage(heroImage);
      if (borderSkin) setBorderSkin(borderSkin);
      if (centerBackground) setCenterBackground(centerBackground);
      setArtistGallery((prev) => [...prev, ...images]);
      logToScreen(`✅ Imported ${images.length} image(s)`);
    } catch (err) {
      logToScreen(`❌ Import failed: ${err.message}`);
    }
  };

  const handleExportGallery = async () => {
    const blob = await exportGalleryData({ heroImage, borderSkin, centerBackground, artistGallery });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YourCuration-Gallery-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    logToScreen('✅ Gallery exported');
  };

  const handleFiles = async (fileList) => {
    setIsUploading(true);
    setCancelUpload(false);
    const files = Array.from(fileList);
    const accepted = files.filter((file) => file.type && ACCEPTED_FORMATS.includes(file.type));

    const existingNames = new Set(artistGallery.map((img) => img.name));
    const valid = [];
    const duplicates = [];
    const warnings = [];

    for (const file of accepted) {
      if (existingNames.has(file.name)) {
        duplicates.push(file);
        warnings.push(`${file.name} is a duplicate.`);
      } else {
        valid.push(file);
      }
    }

    setUploadWarnings(warnings);
    setDuplicateFiles(duplicates);
    setUploadCount((prev) => prev + valid.length);

    const newImages = [];
    for (const file of valid) {
      if (cancelUpload) break;
      const compressed = await compressImage(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(compressed);

      await saveBlob(id, compressed);
      logToScreen(`🧼 Saved to IndexedDB: ${id}`);

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
    setIsUploading(false);

    if (duplicates.length > 0) {
      setShowDuplicateModal(true);
    }
  };

  const uploadDuplicates = async () => {
    const newImages = [];
    for (const file of duplicateFiles) {
      const compressed = await compressImage(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(compressed);

      await saveBlob(id, compressed);
      logToScreen(`🧼 Duplicate uploaded: ${file.name}`);

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
    setUploadCount((prev) => prev + duplicateFiles.length);
    setDuplicateFiles([]);
    setShowDuplicateModal(false);
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
    toggleSampleWithLimit(id, artistGallery, setArtistGallery, setSampleWarningId);
  };

  const toggleImageGallery = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img))
    );
  };

  const toggleImageScrape = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img))
    );
  };

  const removeImage = (id) => {
    setArtistGallery((prev) => prev.filter((img) => img.id !== id));
    setUploadCount((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to reset your entire dashboard?')) return;
    setHeroImage(null);
    setBorderSkin(null);
    setCenterBackground(null);
    setArtistGallery([]);
    setUploadCount(0);
    setUploadWarnings([]);
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
      <ControlBar
        setView={setView}
        onImport={handleImportGallery}
        onExport={handleExportGallery}
        onGenerate={() => setView('generate')}
        onReset={handleReset}
        devMode={devMode}
        setDevMode={setDevMode}
        showDevToggle
        showImport
        showExport
      />

      <HeroSection label="Hero Image" imageState={heroImage} setImageState={setHeroImage} handleSingleUpload={handleSingleUpload} />
      <HeroSection label="Border Skin" imageState={borderSkin} setImageState={setBorderSkin} handleSingleUpload={handleSingleUpload} />
      <HeroSection label="Center Background" imageState={centerBackground} setImageState={setCenterBackground} handleSingleUpload={handleSingleUpload} />

      <UploadWarnings warnings={uploadWarnings} />
      <DragDropUpload dragging={dragging} setDragging={setDragging} handleFiles={handleFiles} />
      <MultiFilePicker onChange={(files) => handleFiles(files)} uploadCount={uploadCount} acceptedFormats={ACCEPTED_FORMATS} />

      {devMode && (
        <>
          <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>
            Debug: artistGallery length = {artistGallery.length}
          </p>
          <div style={{ fontFamily: 'monospace', color: '#555', marginTop: '2rem' }}>
            {logs.map((log, i) => (
              <div key={i}>📦 {log}</div>
            ))}
          </div>
        </>
      )}

      <GalleryGrid
        images={viewGallery.filter(isValidImage)}
        onToggleScrape={toggleImageScrape}
        onRemove={removeImage}
        onToggleGallery={toggleImageGallery}
        onToggleSample={toggleImageSample}
        sampleWarningId={sampleWarningId}
        devMode={devMode}
      />

      {isUploading && (
        <LoadingOverlay
          duration={uploadCount * 300}
          onCancel={() => {
            setCancelUpload(true);
            setIsUploading(false);
          }}
        />
      )}

      {showDuplicateModal && (
        <DuplicateUploadModal
          duplicates={duplicateFiles}
          onConfirm={uploadDuplicates}
          onCancel={() => setShowDuplicateModal(false)}
        />
      )}
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#f3f4f6',
  color: '#1e3a8a',
  cursor: 'pointer',
  marginRight: '0.5rem',
};