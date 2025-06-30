// File: src/utils/DuplicateUploadModal.jsx
import React from 'react';

export default function DuplicateUploadModal({ duplicates, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '0.5rem',
          width: '90%',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: '#1e3a8a' }}>
          Duplicate Files Detected
        </h3>
        <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
          The following files already exist in your gallery:
        </p>
        <ul
          style={{
            textAlign: 'left',
            fontSize: '0.85rem',
            maxHeight: '150px',
            overflowY: 'auto',
            marginBottom: '1rem',
            paddingLeft: '1.25rem',
          }}
        >
          {duplicates.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Would you like to upload them anyway?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#1e3a8a',
              color: '#fff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Yes, Upload
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '0.5rem',
              border: '1px solid #fca5a5',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}