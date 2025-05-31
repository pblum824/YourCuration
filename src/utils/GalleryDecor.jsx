import React from 'react';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

const sectionStyle = {
  fontSize: '1.5rem',
  textAlign: 'center',
  marginBottom: '0.75rem',
  fontFamily: 'Parisienne, cursive',
  color: '#1e3a8a'
};

const uploadButtonStyle = {
  padding: '0.75rem 1.25rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  color: '#1e3a8a',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
};

const imageButton = (bg, color = '#1e3a8a') => ({
  marginTop: '0.5rem',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: bg,
  color: color,
  cursor: 'pointer'
});

export default function GalleryDecor({ heroImage, setHeroImage, borderSkin, setBorderSkin, centerBackground, setCenterBackground, handleSingleUpload }) {
  const blocks = [
    ['Hero Image', heroImage, setHeroImage, 'hero-upload'],
    ['Border Skin', borderSkin, setBorderSkin, 'border-upload'],
    ['Center Background', centerBackground, setCenterBackground, 'center-upload']
  ];

  return (
    <>
      {blocks.map(([label, state, setter, inputId]) => (
        <div key={inputId} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={sectionStyle}>Upload Your {label}</h3>
          <label htmlFor={inputId} style={uploadButtonStyle}>
            Choose File
            <input
              id={inputId}
              type="file"
              accept={ACCEPTED_FORMATS.join(',')}
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
                  borderRadius: '0.5rem'
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
    </>
  );
}