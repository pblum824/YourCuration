
// File: src/ArtistDashboard.jsx
import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import { compressImage, fileToBase64 } from './utils/imageHelpers';
import GalleryControls from './GalleryControls';
import ImageUploadSlot from './ImageUploadSlot';
import GalleryGrid from './GalleryGrid';
import DevToggle from './DevToggle';

const heading = {
  fontSize: '2.25rem',
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#1e3a8a',
  fontFamily: 'Parisienne, cursive',
};

const uploadButtonStyle = {
  padding: '0.75rem 1.25rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  color: '#1e3a8a',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

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

  const isValidImage = (img) => img?.id && img?.url && img?.name;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const valid = files.filter((file) => file.type && ACCEPTED_FORMATS.includes(file.type));
    setUploadWarnings(files.filter((f) => !valid.includes(f)).map((f) => `${f.name} skipped.`));
    setUploadCount((prev) => prev + valid.length);

    const newImages = await Promise.all(
      valid.map(async (file) => {
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(compressed);
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          url: URL.createObjectURL(compressed),
          file: compressed,
          base64,
          scrapeEligible: true,
          metadata: {},
          galleryEligible: true,
          sampleEligible: false,
        };
      })
    );

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
      file: compressed,
      scrapeEligible: true,
      metadata: {},
    });
  };

  const toggleImageSample = (id) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, sampleEligible: !img.sampleEligible } : img
      )
    );

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

  return (
    <div style={{ padding: '2rem' }}>
      <DevToggle devMode={devMode} setDevMode={setDevMode} />
      <h2 style={heading}>Artist Dashboard</h2>

      <GalleryControls
        onExport={() => setView('generate')}
        onImport={() => {}} // implement if needed
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

      <ImageUploadSlot
        label="Hero Image"
        state={heroImage}
        setter={setHeroImage}
        inputId="hero-upload"
        onUpload={handleSingleUpload}
      />
      <ImageUploadSlot
        label="Border Skin"
        state={borderSkin}
        setter={setBorderSkin}
        inputId="border-upload"
        onUpload={handleSingleUpload}
      />
      <ImageUploadSlot
        label="Center Background"
        state={centerBackground}
        setter={setCenterBackground}
        inputId="center-upload"
        onUpload={handleSingleUpload}
      />

      {uploadWarnings.length > 0 && (
        <div style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '1rem' }}>
          <p>Some files were not added:</p>
          <ul>
            {uploadWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: '2px dashed #aaa',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragging ? '#f0fdfa' : '#fff',
          cursor: 'pointer',
          marginBottom: '1.25rem',
          width: '80%',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>Drag and drop images here</p>
        <p style={{ fontSize: '0.85rem', color: '#555' }}>(JPEG, PNG, or WebP only)</p>
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#666' }}>
          YourCuration automatically optimizes uploaded images for preview.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <label htmlFor="multiUpload" style={uploadButtonStyle}>
          Choose Files
          <input
            id="multiUpload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
          {uploadCount === 0
            ? 'No files selected'
            : `${uploadCount} file${uploadCount > 1 ? 's' : ''} selected`}
        </span>
      </div>

      <GalleryGrid
        images={artistGallery.filter(isValidImage)}
        onToggleScrape={toggleImageScrape}
        onRemove={removeImage}
        onToggleGallery={toggleImageGallery}
        onToggleSample={toggleImageSample}
        devMode={devMode}
      />
    </div>
  );
}