// File: src/utils/DuplicateUploadModal.jsx
import React from 'react';

export default function DuplicateUploadModal({ duplicates = [], onConfirm, onCancel }) {
  if (!duplicates.length) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: '1rem', color: '#1e3a8a' }}>Duplicate Files Detected</h2>

        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          The following files already exist in your gallery:
        </p>

        <ul style={listStyle}>
          {duplicates.map((file, index) => (
            <li key={index} style={{ marginBottom: '0.25rem' }}>{file.name}</li>
          ))}
        </ul>

        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          Would you like to upload these files anyway?
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button onClick={onConfirm} style={confirmBtnStyle}>Yes, Upload</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '0.75rem',
  width: '400px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
};

const listStyle = {
  maxHeight: '150px',
  overflowY: 'auto',
  fontSize: '0.85rem',
  paddingLeft: '1rem',
  color: '#444',
};

const cancelBtnStyle = {
  padding: '0.5rem 1.25rem',
  border: '1px solid #ccc',
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

const confirmBtnStyle = {
  padding: '0.5rem 1.25rem',
  border: '1px solid #ccc',
  backgroundColor: '#e0f2fe',
  color: '#075985',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};