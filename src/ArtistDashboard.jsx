import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';

// Styles
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

const imageButton = (bg, color = '#1e3a8a') => ({
  marginTop: '0.5rem',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: bg,
  color: color,
  cursor: 'pointer',
});

const controlButton = {
  margin: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#f9f9f9',
  color: '#1e3a8a',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
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
  const compressImage = async (file, maxWidth = 1600) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) =>
              resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() })),
            file.type,
            0.75
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

  const imageToBase64 = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject('Failed to read image blob');
            reader.readAsDataURL(blob);
          })
      );

  const exportGallery = async () => {
    try {
      const exportImage = async (img) => ({
        name: img.name,
        data: await imageToBase64(img.url),
        scrapeEligible: img.scrapeEligible,
        metadata: img.metadata,
      });

      const bundle = {
        timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
        heroImage: heroImage ? await exportImage(heroImage) : null,
        borderSkin: borderSkin ? await exportImage(borderSkin) : null,
        centerBackground: centerBackground ? await exportImage(centerBackground) : null,
        images: await Promise.all(artistGallery.map(exportImage)),
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `YourCuration-Gallery-${bundle.timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check the console for details.');
    }
  };
  const importGallery = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bundle = JSON.parse(reader.result);
        const toUrl = (data, name, meta, flag) => {
          const byteString = atob(data.split(',')[1]);
          const mime = data.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          const blob = new Blob([ab], { type: mime });
          return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name,
            url: URL.createObjectURL(blob),
            scrapeEligible: flag,
            metadata: meta,
          };
        };

        if (bundle.heroImage)
          setHeroImage(
            toUrl(
              bundle.heroImage.data,
              bundle.heroImage.name,
              bundle.heroImage.metadata,
              bundle.heroImage.scrapeEligible
            )
          );

        if (bundle.borderSkin)
          setBorderSkin(
            toUrl(
              bundle.borderSkin.data,
              bundle.borderSkin.name,
              bundle.borderSkin.metadata,
              bundle.borderSkin.scrapeEligible
            )
          );

        if (bundle.centerBackground)
          setCenterBackground(
            toUrl(
              bundle.centerBackground.data,
              bundle.centerBackground.name,
              bundle.centerBackground.metadata,
              bundle.centerBackground.scrapeEligible
            )
          );

        if (Array.isArray(bundle.images))
          setArtistGallery(
            bundle.images.map((img) =>
              toUrl(img.data, img.name, img.metadata, img.scrapeEligible)
            )
          );

        alert('Gallery imported successfully!');
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import gallery. Please check your file.');
      }
    };

    reader.readAsText(file);
  };
  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const valid = files.filter((file) => file.type && ACCEPTED_FORMATS.includes(file.type));
    setUploadWarnings(files.filter((f) => !valid.includes(f)).map((f) => `${f.name} skipped.`));
    setUploadCount(prev => prev + valid.length);

    const newImages = await Promise.all(
      valid.map(async (file) => {
        const compressed = await compressImage(file);
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          url: URL.createObjectURL(compressed),
          file: compressed,
          scrapeEligible: true,
          metadata: {},
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

  const toggleScrape = (setter) =>
    setter((prev) => ({
      ...prev,
      scrapeEligible: !prev.scrapeEligible,
    }));

  const toggleImageScrape = (id) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );

  const removeImage = (id) => {
    setArtistGallery(prev => prev.filter(img => img.id !== id));
    setUploadCount(prev => Math.max(0, prev - 1));
  };
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
          <button onClick={() => setDevMode(!devMode)} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            {devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
          </button>
        </div>

        <h2 style={heading}>Artist Dashboard</h2>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={exportGallery} style={controlButton}>
              Export
            </button>
            <button
              onClick={() => setView('generate')}
              style={{ ...controlButton, backgroundColor: '#e0f2fe' }}
            >
              Generate Tags →
            </button>
            <label style={{ ...controlButton, display: 'inline-block' }}>
              Import
              <input
                type="file"
                accept=".json"
                onChange={importGallery}
                style={{ display: 'none' }}
              />
            </label>
            <button
              onClick={() => {
                if (!window.confirm('Are you sure you want to reset your entire dashboard? This will remove all uploads and settings.')) return;
                setHeroImage(null);
                setBorderSkin(null);
                setCenterBackground(null);
                setArtistGallery([]);
                setUploadCount(0);
                setUploadWarnings([]);
              }}
              style={{ ...controlButton, backgroundColor: '#fee2e2', color: '#b91c1c' }}
            >
              Reset
            </button>
          </div>
        </div>

        {[['Hero Image', heroImage, setHeroImage, 'hero-upload'],
          ['Border Skin', borderSkin, setBorderSkin, 'border-upload'],
          ['Center Background', centerBackground, setCenterBackground, 'center-upload']].map(([label, state, setter, inputId]) => (
          <div key={inputId} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={section}>Upload Your {label}</h3>
            <label htmlFor={inputId} style={uploadButtonStyle}>
              Choose File
              <input
                id={inputId}
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleUpload(e, setter)}
                style={{ display: 'none' }}
              />
            </label>
            {state?.url && (
              <div>
                <img
                  src={state.url}
                  alt={state.name}
                  style={{
                    maxWidth: '480px',
                    width: '100%',
                    marginTop: '1rem',
                    borderRadius: '0.5rem',
                  }}
                />
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setter(null)}
                    style={imageButton('#fef2f2', '#991b1b')}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

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

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {artistGallery.map((img) => (
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
                onClick={() => toggleImageScrape(img.id)}
                style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
              >
                {img.scrapeEligible ? 'Accepted' : 'Excluded'}
              </button>
              <button
                onClick={() => removeImage(img.id)}
                style={imageButton('#fef2f2', '#991b1b')}
              >
                Remove
              </button>
              {devMode && (
                <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>
                  {JSON.stringify(img.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    );
    }
