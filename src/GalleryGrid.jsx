// File: src/GalleryGrid.jsx
import React from 'react';
import ImageCard from './ImageCard';

export default function GalleryGrid({
  images,
  onToggleScrape,
  onRemove,
  onToggleGallery,
  onToggleSample,
  devMode,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'flex-end',
        minHeight: '240px',
      }}
    >
      {images.map((img) => (
        <ImageCard
          key={img.id}
          image={img}
          onToggleScrape={onToggleScrape}
          onRemove={onRemove}
          onToggleGallery={onToggleGallery}
          onToggleSample={onToggleSample}
          devMode={devMode}
        />
      ))}
    </div>
  );
}