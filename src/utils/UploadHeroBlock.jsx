// File: src/UploadHeroBlock.jsx
import React from 'react';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';
import { useCuration } from './YourCurationContext';

const UploadHeroBlock = ({ label, imageState, setImage, inputId, uploadButtonStyle, imageButton }) => {
  const { selectedFont } = useFontSettings();
  const { mode } = useCuration();

  const handleSingleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        url: reader.result,
        file,
        scrapeEligible: true,
        metadata: {},
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a', ...getFontStyle(mode, { selectedFont }) }}>
        Upload Your {label}
      </h3>
      <label htmlFor={inputId} style={uploadButtonStyle}>
        Choose File
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleSingleUpload}
          style={{ display: 'none' }}
        />
      </label>
      {imageState?.url && (
        <div>
          <img
            src={imageState.url}
            alt={imageState.name}
            style={{ maxWidth: '480px', width: '100%', marginTop: '1rem', borderRadius: '0.5rem' }}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => setImage(null)}
              style={imageButton('#fef2f2', '#991b1b')}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHeroBlock;