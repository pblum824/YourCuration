import React, { useState } from 'react';
import generateMetadata from './utils/generateMetadata';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

export default function ArtistDashboard() {
  const [heroImage, setHeroImage] = useState(null);
  const [borderSkin, setBorderSkin] = useState(null);
  const [centerBackground, setCenterBackground] = useState(null);
  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);

  const handleSingleUpload = (e, setState) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_FORMATS.includes(file.type)) return alert('Unsupported format');
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) return alert('File too large');
    const url = URL.createObjectURL(file);
    setState({ name: file.name, url });
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    const validFiles = files.filter((file) => {
      const isValidType = ACCEPTED_FORMATS.includes(file.type);
      const isValidSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
      scrapeEligible: true,
      metadata: generateMetadata(file.name),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const toggleScrape = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );
  };

  const renderPreview = (image) =>
    image && (
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <img
          src={image.url}
          alt={image.name}
          style={{
            maxWidth: '480px',
            width: '100%',
            height: 'auto',
            borderRadius: '0.5rem',
            boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
          }}
        />
        <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{image.name}</p>
      </div>
    );

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={heading}>Artist Dashboard</h2>

      {/* Hero Image */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h3 style={section}>Upload Your Hero Image</h3>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => handleSingleUpload(e, setHeroImage)}
        />
        {renderPreview(heroImage)}
      </div>

      {/* Border Skin */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h3 style={section}>Upload Your Border Skin</h3>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => handleSingleUpload(e, setBorderSkin)}
        />
        {renderPreview(borderSkin)}
      </div>

      {/* Center Background */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h3 style={section}>Upload Your Center Background</h3>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => handleSingleUpload(e, setCenterBackground)}
        />
        {renderPreview(centerBackground)}
      </div>

      {/* Photo Library */}
      <h3 style={section}>Your Photo Library</h3>

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
        <p style={{ marginBottom: '0.5rem' }}>
          Drag and drop images here
        </p>
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          (JPEG, PNG, or WebP only — Max 10MB each)
        </p>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '1rem' }}>— or —</p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <label
          htmlFor="multiUpload"
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid #ccc',
            cursor: 'pointer',
            fontFamily: 'sans-serif', // intentional by design
            color: '#1e3a8a',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
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
      </div>

      {/* Image Previews */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'center',
        }}
      >
        {images.map((img) => (
          <div key={img.id} style={{ width: '300px', textAlign: 'center' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>
            <button
              onClick={() => toggleScrape(img.id)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor: img.scrapeEligible ? '#d1fae5' : '#fee2e2',
                cursor: 'pointer',
              }}
            >
              {img.scrapeEligible ? 'Eligible for Scrape' : 'Excluded'}
            </button>
            <p
              style={{
                fontSize: '0.85rem',
                fontStyle: 'italic',
                marginTop: '0.5rem',
              }}
            >
              Tags: {img.metadata.tags.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const heading = {
  fontSize: '2.25rem',
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#1e3a8a',
  fontFamily: 'Parisienne, cursive',
};

const section = {
  fontSize: '1.5rem',
  textAlign: 'center',
  marginBottom: '0.75rem',
  fontFamily: 'Parisienne, cursive',
  color: '#1e3a8a',
};