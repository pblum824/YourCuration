import React from 'react';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';

export default function MultiFilePicker({ onChange, uploadCount, acceptedFormats }) {
  const { selectedFont } = useFontSettings();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}
    >
      <label
        htmlFor="multiUpload"
        style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          cursor: 'pointer',
          ...getFontStyle('artist', { selectedFont }),
          color: '#1e3a8a',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}
      >
        Choose Files
        <input
          id="multiUpload"
          type="file"
          accept={acceptedFormats.join(',')}
          multiple
          onChange={(e) => onChange(e.target.files)}
          style={{ display: 'none' }}
        />
      </label>
      <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
        {uploadCount === 0
          ? 'No files selected'
          : `${uploadCount} file${uploadCount > 1 ? 's' : ''} selected`}
      </span>
    </div>
  );
}