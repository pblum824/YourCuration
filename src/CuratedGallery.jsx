import React from 'react';
import generateMetadata from './utils/generateMetadata';

const artistLibrary = [
  {
    id: 'a101',
    src: '/artist-images/a101.jpg',
    scrapeEligible: true,
    metadata: {
      tags: ['animal', 'backlit', 'rule-of-thirds', 'nostalgic'],
    },
  },
  {
    id: 'a102',
    src: '/artist-images/a102.jpg',
    scrapeEligible: true,
    metadata: {
      tags: ['figure', 'monochrome', 'soft-focus', 'centered-subject'],
    },
  },
  {
    id: 'a103',
    src: '/artist-images/a103.jpg',
    scrapeEligible: true,
    metadata: {
      tags: ['landscape', 'cool-toned', 'symmetry', 'calm'],
    },
  },
  {
    id: 'a104',
    src: '/artist-images/a104.jpg',
    scrapeEligible: true,
    metadata: {
      tags: ['animal', 'grainy', 'negative-space', 'eerie'],
    },
  },
  {
    id: 'a105',
    src: '/artist-images/a105.jpg',
    scrapeEligible: false,
    metadata: {
      tags: ['still-life', 'warm-toned', 'sharp'],
    },
  },
];

function findSimilarPhotos(lovedSamples, dislikedSamples, artistLibrary) {
  const lovedTags = lovedSamples.flatMap(sample =>
    generateMetadata(sample.id).metadata.tags
  );

  const dislikedTags = dislikedSamples.flatMap(sample =>
    generateMetadata(sample.id).metadata.tags
  );

  const matched = artistLibrary.filter(photo => {
    if (!photo.scrapeEligible) return false;

    const tags = photo.metadata.tags;
    const hasPositive = tags.some(tag => lovedTags.includes(tag));
    const hasNegative = tags.some(tag => dislikedTags.includes(tag));

    return hasPositive && !hasNegative;
  });

  return { matched, lovedTags, dislikedTags };
}

export default function CuratedGallery({ lovedSamples, dislikedSamples }) {
  const { matched, lovedTags, dislikedTags } = findSimilarPhotos(
    lovedSamples,
    dislikedSamples,
    artistLibrary
  );

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

      <div style={{ margin: '0 auto', maxWidth: '700px', textAlign: 'center', marginBottom: '2rem' }}>
        <p><strong>Loved Tags:</strong> {lovedTags.join(', ')}</p>
        <p><strong>Disliked Tags:</strong> {dislikedTags.join(', ')}</p>
      </div>

      {matched.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.25rem', fontStyle: 'italic' }}>
          No matches found from artist library.
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
          {matched.map((img, index) => (
            <div key={img?.id || index} style={{ maxWidth: '320px', textAlign: 'center' }}>
              <img
                src={img?.src}
                alt={`Matched ${img?.id}`}
                style={{
                  maxWidth: '320px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  objectFit: 'cover',
                }}
              />
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                Tags: {img?.metadata?.tags?.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}