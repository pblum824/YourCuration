// File: src/CuratedGalleryFinal.jsx
import React from 'react';
import { useCuration } from './YourCurationContext';

export default function CuratedGalleryFinal() {
  const { artistGallery, galleryRatings } = useCuration();

  // extract all rated images
  const ratedImages = artistGallery.filter((img) =>
    galleryRatings?.[img.id] !== undefined
  );

  // yes = 2, maybe = 1, less = 0
  const strongYes = ratedImages.filter((img) => galleryRatings[img.id] === 2);
  const softYes = ratedImages.filter((img) => galleryRatings[img.id] === 1);

  // fill final list up to 20
  const finalImages = [
    ...strongYes,
    ...softYes.slice(0, 20 - strongYes.length)
  ].slice(0, 20);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', fontSize: '2rem', marginBottom: '1rem', color: '#1e3a8a' }}>
        YourCuration: Final Selection
      </h2>
      {finalImages.length === 0 ? (
        <p style={{ fontSize: '1rem', color: '#666' }}>No final selections were made yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
          }}
        >
          {finalImages.map((img) => (
            <div key={img.id} style={{ textAlign: 'center' }}>
              <img
                src={img.url}
                alt={img.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
              <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}