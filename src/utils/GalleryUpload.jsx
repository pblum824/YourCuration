// File: src/GalleryUpload.jsx
import React from 'react';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function GalleryUpload({ handleFiles, uploadCount, uploadWarnings }) {
  const [dragging, setDragging] = React.useState(false);
  const { selectedFont } = useFontSettings();

  return (
    <>
      {uploadWarnings.length > 0 && (
        <div style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '1rem', ...getFontStyle('artist', { selectedFont }) }}>
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
          ...getFontStyle('artist', { selectedFont })
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
        <label style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          cursor: 'pointer',
          ...getFontStyle('artist', { selectedFont }),
          color: '#1e3a8a',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          Choose Files
          <input
            id="multiUpload"
            type="file"
            accept={ACCEPTED_FORMATS.join(',')}
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
          {uploadCount === 0 ? 'No files selected' : `${uploadCount} file${uploadCount > 1 ? 's' : ''} selected`}
        </span>
      </div>
    </>
  );
}