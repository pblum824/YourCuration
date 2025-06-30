// File: src/utils/DuplicateUploadModal.jsx
import React from 'react';

export default function DuplicateUploadModal({ duplicates, onConfirm, onCancel }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: '1rem', color: '#1e3a8a' }}>Duplicate Files Detected</h3>
        <ul style={{ textAlign: 'left', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
          {duplicates.map((name, i) => (
            <li key={i} style={{ marginBottom: '0.25rem' }}>📁 {name}</li>
          ))}
        </ul>
        <p style={{ marginBottom: '1.5rem', color: '#333' }}>
          Do you want to upload these duplicates anyway?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button style={buttonStyle} onClick={onCancel}>Cancel</button>
          <button style={{ ...buttonStyle, backgroundColor: '#1e3a8a', color: '#fff' }} onClick={onConfirm}>
            Yes, Upload
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '0.5rem',
  maxWidth: '400px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  textAlign: 'center',
};

const buttonStyle = {
  padding: '0.5rem 1.25rem',
  fontSize: '0.95rem',
  borderRadius: '0.5rem',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#f3f4f6',
};