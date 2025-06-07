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
          justifyContent: 'center',
          alignItems: 'stretch', // ensures card bottoms align
          gap: '2rem',
          padding: '1rem',
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