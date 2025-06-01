import React from 'react';

const sectionStyle = {
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

export default function HeroSection({ label, imageState, setImageState, handleSingleUpload }) {
  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-upload`;

  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <h3 style={sectionStyle}>Upload Your {label}</h3>
      <label htmlFor={inputId} style={uploadButtonStyle}>
        Choose File
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={(e) => handleSingleUpload(e, setImageState)}
          style={{ display: 'none' }}
        />
      </label>
      {imageState?.url && (
        <div>
          <img
            src={imageState.url}
            alt={imageState.name}
            style={{
              maxWidth: '480px',
              width: '100%',
              marginTop: '1rem',
              borderRadius: '0.5rem',
            }}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => setImageState(null)}
              style={{
                ...uploadButtonStyle,
                backgroundColor: '#fef2f2',
                color: '#991b1b'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}