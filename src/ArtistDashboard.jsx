// File: src/ArtistDashboard.jsx
import React, { useState, useRef } from 'react';
import { useCuration } from './YourCurationContext';
import { compressImage } from './utils/imageHelpers';
import { saveBlob } from './utils/dbCache';
import { importGalleryData, exportGalleryData } from './utils/galleryIO';
import { importZipBundle, exportZipBundle, cacheImageToZip } from './utils/zipStore';
import { getImageStorageMode } from './utils/imageStore';
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
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';
import { storageModeSelector } from './utils/storageModeSelector';
import { autoConvertToSupportedFormat } from './utils/imageFormatHandlers';
import { FontSelectorDevPanel } from './FontSelectorDevPanel';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ArtistDashboard({ setView }) {
  const { selectedFont, setSelectedFont } = useFontSettings();
  const {
    artistGallery,
    setArtistGallery,
    galleryTotalSize,
    setGalleryTotalSize
  } = useCuration();
  const { devMode, setDevMode } = useDevMode();

  const [heroImage, setHeroImage] = useState(null);
  const [borderSkin, setBorderSkin] = useState(null);
  const [centerBackground, setCenterBackground] = useState(null);
  const [dragging, setDragging] = useState(false);
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
      const isZip = file.name.endsWith('.zip') || file.type === 'application/zip';
      const {
        heroImage,
        borderSkin,
        centerBackground,
        images,
        selectedFont: importedFont,
        galleryTotalSize: importedSize = 0,
      } = isZip ? await importZipBundle(file) : await importGalleryData(file);

      if (importedFont) setSelectedFont(importedFont);
      if (heroImage) setHeroImage(heroImage);
      if (borderSkin) setBorderSkin(borderSkin);
      if (centerBackground) setCenterBackground(centerBackground);

      setArtistGallery((prev) => [...prev, ...images]);
      setGalleryTotalSize((prev) => prev + importedSize);

      logToScreen(`✅ Imported ${images.length} image(s) from ${isZip ? 'ZIP' : 'JSON'}`);
    } catch (err) {
      logToScreen(`❌ Import failed: ${err.message}`);
    }
  };

  const handleExportGallery = async () => {
    try {
      const strategy = storageModeSelector(galleryTotalSize, true);
      logToScreen(`📦 Export strategy: ${strategy}`);

      let blob;
      if (strategy === 'zip') {
        const allImages = [heroImage, borderSkin, centerBackground, ...artistGallery].filter(Boolean);

        for (const img of allImages) {
          try {
            const res = await fetch(img.url);
            const fileBlob = await res.blob();
            await cacheImageToZip(img.id, fileBlob);
          } catch {
            logToScreen(`⚠️ Failed to cache ${img.name || img.id} to ZIP`);
          }
        }

        blob = await exportZipBundle({
          heroImage,
          borderSkin,
          centerBackground,
          artistGallery,
          selectedFont,
        });
      } else {
        blob = await exportGalleryData({
          heroImage,
          borderSkin,
          centerBackground,
          artistGallery,
          galleryTotalSize,
          selectedFont,
        });
      }

      if (!blob || !(blob instanceof Blob)) {
        logToScreen('❌ Export failed: Invalid blob');
        return;
      }

      const url = URL.createObjectURL(blob);
      const ext = strategy === 'zip' ? 'zip' : 'json';
      const link = document.createElement('a');
      link.href = url;
      link.download = `YourCuration-Gallery-${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`;
      link.click();

      logToScreen('✅ Gallery exported');
    } catch (err) {
      logToScreen(`❌ Export failed: ${err.message}`);
    }
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

    const totalProjected = artistGallery.length + valid.length;
    const strategy = storageModeSelector(totalProjected);
    logToScreen(`🧐 Storage mode: ${strategy}`);

    let newSize = 0;
    const newImages = [];
    for (let file of valid) {
      file = await autoConvertToSupportedFormat(file, logToScreen);
      if (!file) continue;
      if (cancelUpload) break;
      const compressed = await compressImage(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(compressed);

      await saveBlob(id, compressed);
      newSize += compressed.size;
      logToScreen(`🧼 Saved to IndexedDB: ${id}`);

      newImages.push({
        id,
        name: file.name,
        url,
        scrapeEligible: true,
        metadata: {
          original: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
        },
        galleryEligible: true,
        sampleEligible: false,
        localRefId: id,
      });
    }

    setArtistGallery((prev) => [...prev, ...newImages]);
    setGalleryTotalSize((prev) => prev + newSize);
    setIsUploading(false);

    if (duplicates.length > 0 && newImages.length === 0) {
      setUploadWarnings(warnings);
    } else {
      setUploadWarnings([]);
    }

    if (duplicates.length > 0) {
      setShowDuplicateModal(true);
    }
  };

  const uploadDuplicates = async () => {
    setShowDuplicateModal(false);
    let newSize = 0;
    const newImages = [];
    for (let file of duplicateFiles) {
      file = await autoConvertToSupportedFormat(file, logToScreen);
      if (!file) continue;
      const compressed = await compressImage(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(compressed);

      await saveBlob(id, compressed);
      newSize += compressed.size;
      logToScreen(`🧼 Duplicate uploaded: ${file.name}`);

      newImages.push({
        id,
        name: file.name,
        url,
        scrapeEligible: true,
        metadata: {
          original: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
        },
        galleryEligible: true,
        sampleEligible: false,
        localRefId: id,
      });
    }

    setArtistGallery((prev) => [...prev, ...newImages]);
    setGalleryTotalSize((prev) => prev + newSize);
    setDuplicateFiles([]);
    setUploadWarnings([]);
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
      metadata: {
        original: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        },
      },
    });
    setGalleryTotalSize((prev) => prev + compressed.size);
  };

  const toggleImageSample = (id) => {
    toggleSampleWithLimit(id, artistGallery, setArtistGallery, setSampleWarningId);
  };

  const toggleImageGallery = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img
      )
    );
  };

  const toggleImageScrape = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );
  };

  const removeImage = (id) => {
    setArtistGallery((prev) => prev.filter((img) => img.id !== id));
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to reset your entire dashboard?')) return;
    setHeroImage(null);
    setBorderSkin(null);
    setCenterBackground(null);
    setArtistGallery([]);
    setUploadWarnings([]);
    setGalleryTotalSize(0);
  };

  const viewGallery = artistGallery.map((img) => ({
    id: img.id,
    name: img.name,
    url: img.url,
    sampleEligible: img.sampleEligible,
    galleryEligible: img.galleryEligible,
    scrapeEligible: img.scrapeEligible,
    metadata: img.metadata,
    localRefId: img.localRefId,
  }));

  return (
      <div style={{ padding: '1rem 1rem 2rem' }}>
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
        {devMode && <FontSelectorDevPanel />}
      <HeroSection label="Hero Image" imageState={heroImage} setImageState={setHeroImage} handleSingleUpload={handleSingleUpload} />
      <HeroSection label="Border Skin" imageState={borderSkin} setImageState={setBorderSkin} handleSingleUpload={handleSingleUpload} />
      <HeroSection label="Center Background" imageState={centerBackground} setImageState={setCenterBackground} handleSingleUpload={handleSingleUpload} />

      <UploadWarnings warnings={uploadWarnings} />
      <DragDropUpload dragging={dragging} setDragging={setDragging} handleFiles={handleFiles} />
      <MultiFilePicker onChange={(files) => handleFiles(files)} acceptedFormats={ACCEPTED_FORMATS} />

      <div style={{
        marginTop: 10,
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        {artistGallery.length === 0
          ? 'No files uploaded'
          : `${artistGallery.length} files uploaded`}
      </div>

      {devMode && (
        <>
          <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>
            Debug: artistGallery length = {artistGallery.length}
          </p>
          <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>
            Debug: galleryTotalSize = {(galleryTotalSize / (1024 * 1024)).toFixed(2)} MB
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
          imageCount={artistGallery.length}
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