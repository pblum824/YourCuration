import React from 'react';

const dropZoneStyle = {
  border: '2px dashed #aaa',
  borderRadius: '1rem',
  padding: '2rem',
  textAlign: 'center',
  backgroundColor: '#fff',
  cursor: 'pointer',
  marginBottom: '1.25rem',
  width: '80%',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

export default function DragDropUpload({ onDrop, dragging, setDragging }) {
  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onDrop(e.dataTransfer.files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      style={{
        ...dropZoneStyle,
        backgroundColor: dragging ? '#f0fdfa' : '#fff'
      }}
    >
      <p style={{ marginBottom: '0.5rem' }}>Drag and drop images here</p>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>(JPEG, PNG, or WebP only)</p>
      <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#666' }}>
        YourCuration automatically optimizes uploaded images for preview.
      </p>
    </div>
  );
}