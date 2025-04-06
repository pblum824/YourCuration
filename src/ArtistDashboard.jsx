
import React, { useState, useEffect } from 'react';
import generateMetadata from './utils/generateMetadata';
import AppReadyState from './AppReadyState';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

export default function ArtistDashboard() {
  const [heroImage, setHeroImage] = useState(null);
  const [borderSkin, setBorderSkin] = useState(null);
  const [centerBackground, setCenterBackground] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadWarnings, setUploadWarnings] = useState([]);
  const [images, setImages] = useState(() => {
    const stored = localStorage.getItem('yourcuration_artistImages');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('yourcuration_artistImages', JSON.stringify(images));
  }, [images]);

  const compressImage = async (file, maxWidth = 1600) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            0.75
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const createImageObject = async (file) => {
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: file.name,
      url,
      scrapeEligible: true,
      metadata: generateMetadata(file.name),
    };
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const newWarnings = [];

    const validFiles = files.filter((file) => {
      if (!file.type || !file.size) {
        newWarnings.push(`${file.name || 'Unnamed file'} skipped: not fully downloaded or invalid format.`);
        return false;
      }
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        newWarnings.push(`${file.name} skipped: unsupported file type.`);
        return false;
      }
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        newWarnings.push(`${file.name} skipped: file exceeds 10MB.`);
        return false;
      }
      return true;
    });

    setUploadWarnings(newWarnings);
    setUploadCount(validFiles.length);

    const newImages = await Promise.all(validFiles.map(createImageObject));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleSingleUpload = async (e, setState) => {
    const file = e.target.files[0];
    if (!file) return;

    const warnings = [];
    if (!file.type || !file.size) {
      warnings.push(`${file.name || 'Unnamed file'} skipped: not fully downloaded or invalid format.`);
    } else if (!ACCEPTED_FORMATS.includes(file.type)) {
      warnings.push(`${file.name} skipped: unsupported file type.`);
    } else if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      warnings.push(`${file.name} skipped: file exceeds 10MB.`);
    }

    if (warnings.length > 0) {
      setUploadWarnings(warnings);
      return;
    }

    const imageObj = await createImageObject(file);
    setUploadWarnings([]);
    setState(imageObj);
  };

  const toggleScrape = (imageSetter) => {
    imageSetter((prev) => ({
      ...prev,
      scrapeEligible: !prev.scrapeEligible,
    }));
  };

  const toggleImageScrape = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const resetDashboard = () => {
    const confirmed = window.confirm('Are you sure you want to reset your entire dashboard? This will remove all uploads and settings.');
    if (!confirmed) return;

    localStorage.removeItem('yourcuration_artistImages');
    localStorage.removeItem('yourcuration_ready');
    localStorage.removeItem('yourcuration_readyBundle');

    setHeroImage(null);
    setBorderSkin(null);
    setCenterBackground(null);
    setImages([]);
    setUploadWarnings([]);
    setUploadCount(0);
  };

  const exportGallery = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const bundle = {
      timestamp,
      heroImage,
      borderSkin,
      centerBackground,
      images,
    };
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `YourCuration-Gallery-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={heading}>Artist Dashboard</h2>

      {/* Presentation Mode + Top Controls */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <AppReadyState
          heroImage={heroImage}
          borderSkin={borderSkin}
          centerBackground={centerBackground}
          images={images}
          clientSessions={[]}
        />
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={exportGallery} style={controlButton}>
            Export YourCuration Gallery
          </button>
          <button onClick={() => alert('Import logic coming soon')} style={controlButton}>
            Import YourCuration Gallery
          </button>
          <button
            onClick={resetDashboard}
            style={{ ...controlButton, backgroundColor: '#fee2e2', color: '#b91c1c' }}
          >
            Reset Entire Dashboard
          </button>
        </div>
      </div>

      {/* Upload Sections */}
      {[['Hero Image', heroImage, setHeroImage, 'hero-upload'],
        ['Border Skin', borderSkin, setBorderSkin, 'border-upload'],
        ['Center Background', centerBackground, setCenterBackground, 'center-upload']
      ].map(([label, state, setter, inputId]) => (
        <div key={inputId} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={section}>Upload Your {label}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label htmlFor={inputId} style={uploadButtonStyle}>
              Choose File
              <input
                id={inputId}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleSingleUpload(e, setter)}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              {state?.name || 'No file selected'}
            </span>
          </div>
          {state?.url && (
            <>
              <img
                src={state.url}
                alt={state.name}
                style={{
                  maxWidth: '480px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const msg = e.target.nextElementSibling;
                  if (msg) msg.style.display = 'block';
                }}
              />
              <p style={{ display: 'none', fontSize: '0.9rem', fontStyle: 'italic', color: '#991b1b' }}>
                Preview not available
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => toggleScrape(setter)}
                  style={imageButton(state.scrapeEligible ? '#d1fae5' : '#fee2e2')}
                >
                  {state.scrapeEligible ? 'Accepted' : 'Excluded'}
                </button>
                <button
                  onClick={() => setter(null)}
                  style={imageButton('#fef2f2', '#991b1b')}
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      <h3 style={section}>Your Photo Library</h3>

      {/* Drag-and-drop + compression message */}
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
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          (JPEG, PNG, or WebP only — Max 10MB each)
        </p>
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#666' }}>
          YourCuration automatically optimizes images for preview. Use full-res outside this tool if needed.
        </p>
      </div>

      {/* Multi-upload input */}
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
          {uploadCount === 0 ? 'No files selected' : `${uploadCount} file${uploadCount > 1 ? 's' : ''} selected`}
        </span>
      </div>

      {/* Warnings */}
      {uploadWarnings.length > 0 && (
        <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#b91c1c' }}>
          <p style={{ fontWeight: 600 }}>Some files were not added:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {uploadWarnings.map((warn, i) => (
              <li key={i} style={{ fontSize: '0.9rem' }}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Image Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '300px', textAlign: 'center' }}>
            {img.url ? (
              <img
                src={img.url}
                alt={img.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const msg = e.target.nextElementSibling;
                  if (msg) msg.style.display = 'block';
                }}
              />
            ) : null}
            <p style={{ display: 'none', fontSize: '0.9rem', fontStyle: 'italic', color: '#991b1b' }}>
              Preview not available
            </p>
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
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
              Tags: {img.metadata?.tags?.join(', ') || 'No tags'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

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