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
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Curated Gallery</h2>
      {loved.length === 0 ? (
        <p>No favorites selected yet. Try the Viewer first!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loved.map((img) => (
            <img
              key={img.id}
              src={img.src}
              alt={`Favorite ${img.id}`}
              className="rounded shadow-md"
            />
          ))}
        </div>
      )}
    </div>
  );
}