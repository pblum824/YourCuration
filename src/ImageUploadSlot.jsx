// File: components/ImageUploadSlot.jsx
import React from 'react';
import { uploadButtonStyle, section, imageButton } from './utils/styles';

export default function ImageUploadSlot({ label, state, setter, inputId, onUpload }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <h3 style={section}>Upload Your {label}</h3>
      <label htmlFor={inputId} style={uploadButtonStyle}>
        Choose File
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e, setter)}
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
  );
}