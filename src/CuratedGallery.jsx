import React from 'react';

const sampleImages = [
  { id: 1, src: '/samples/sample1.jpg' },
  { id: 2, src: '/samples/sample2.jpg' },
  { id: 3, src: '/samples/sample3.jpg' },
  { id: 4, src: '/samples/sample4.jpg' },
  { id: 5, src: '/samples/sample5.jpg' },
  { id: 6, src: '/samples/sample6.jpg' },
  { id: 7, src: '/samples/sample7.jpg' },
  { id: 8, src: '/samples/sample8.jpg' },
  { id: 9, src: '/samples/sample9.jpg' }
];

export default function CuratedGallery({ ratings }) {
  const loved = ratings
    .filter((r) => r.score === 3)
    .map((r) => sampleImages.find((img) => img.id === r.id))
    .filter(Boolean);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h2
        style={{
          fontSize: '2.25rem',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1e3a8a',
          fontFamily: 'Parisienne, cursive',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Your Curated Gallery
      </h2>
      {loved.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.25rem', fontStyle: 'italic' }}>
          No favorites selected yet. Try the Viewer first!
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2.5rem',
          }}
        >
          {loved.map((img, index) => (
            <img
              key={img?.id || index}
              src={img?.src}
              alt={`Favorite ${img?.id}`}
              style={{
                maxWidth: '320px',
                width: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                objectFit: 'cover',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}