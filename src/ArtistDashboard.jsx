import React, { useState } from 'react';
import generateMetadata from './utils/generateMetadata';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

export default function ArtistDashboard() {
  const [heroImage, setHeroImage] = useState(null);
  const [images, setImages] = useState([]);

  const handleHeroUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_FORMATS.includes(file.type)) return alert('Unsupported format');
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) return alert('File too large');

    const url = URL.createObjectURL(file);
    setHeroImage({ name: file.name, url });
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);

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

  return (
    <div style={{ padding: '2rem' }}>
      <h2
        style={{
          fontSize: '2.25rem',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1e3a8a',
          fontFamily: 'Parisienne, cursive',
        }}
      >
        Artist Dashboard
      </h2>

      {/* Hero image upload */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Upload Your Hero Image
        </h3>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleHeroUpload}
          style={{ marginBottom: '1rem' }}
        />
        {heroImage && (
          <div style={{ marginTop: '1rem' }}>
            <img
              src={heroImage.url}
              alt={heroImage.name}
              style={{
                maxWidth: '480px',
                width: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
              }}
            />
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{heroImage.name}</p>
          </div>
        )}
      </div>

      {/* Regular uploads */}
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={handleUpload}
        style={{ marginBottom: '2rem', display: 'block', margin: '0 auto' }}
      />

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
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
              {img.name}
            </p>
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