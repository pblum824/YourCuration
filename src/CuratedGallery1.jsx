import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { aggregateSampleTags, scoreImage, extractAllTags } from './utils/scoreImage';
import { loadBlob } from './utils/dbCache';

const LABELS = ['Less', 'Maybe', 'Yes!!'];

export default function CuratedGallery1({ setView }) {
  const {
    artistGallery = [],
    ratings = {},
    galleryRatings,
    setGalleryRatings
  } = useCuration();

  const [samples, setSamples] = useState([]);
  const [tagPools, setTagPools] = useState({});
  const [scored, setScored] = useState([]);
  const [strong, setStrong] = useState([]);
  const [medium, setMedium] = useState([]);
  const [weak, setWeak] = useState([]);
  const [hydrated, setHydrated] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const RATING_WEIGHTS = { love: 2, like: 1, less: 0 };
      const numericRatings = Object.fromEntries(
        Object.entries(ratings).map(([id, val]) => [id, RATING_WEIGHTS[val]])
      );

      const sampleImgs = artistGallery.filter((img) => ratings[img.id]);
      setSamples(sampleImgs);

      const candidates = artistGallery.filter(
        (img) => img.galleryEligible && !ratings[img.id]
      );

      const tags = aggregateSampleTags(sampleImgs, numericRatings);
      setTagPools(tags);

      const scoredImgs = candidates.map((img) => ({
        ...img,
        matchScore: scoreImage(img, tags),
      }));

      setScored(scoredImgs);

      const strong = scoredImgs.filter((img) => img.matchScore >= 6).slice(0, 8);
      const medium = scoredImgs.filter((img) => img.matchScore >= 2 && img.matchScore < 6).slice(0, 8);
      const weak = scoredImgs.filter((img) => img.matchScore < 2).slice(0, 4);

      setStrong(strong);
      setMedium(medium);
      setWeak(weak);

      const all = [...strong, ...medium, ...weak];

      async function hydrate() {
        const hydrated = await Promise.all(
          all.map(async (img) => {
            try {
              const blob = await loadBlob(img.localRefId);
              const url = URL.createObjectURL(blob);
              return { id: img.id, name: img.name, url };
            } catch {
              return { id: img.id, name: img.name, url: '' };
            }
          })
        );
        setHydrated(hydrated);
      }

      hydrate();
    } catch (err) {
      setError(err.message || 'Unknown error in CG1');
    }
  }, [artistGallery, ratings]);

  const handleToggle = (id) => {
    setGalleryRatings((prev) => {
      const current = prev[id] ?? 1;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        ❌ CG1 Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', fontSize: '2rem', color: '#1e3a8a' }}>
        Curated Gallery Preview
      </h2>

      <div style={{ fontFamily: 'monospace', background: '#f9f9f9', padding: '1rem', border: '1px solid #ddd', marginBottom: '2rem' }}>
        <div><strong>Sample Images:</strong> {samples.map(s => s.name).join(', ') || 'None'}</div>
        <div><strong>Tag Pools:</strong> image={tagPools.image?.size || 0}, text={tagPools.text?.size || 0}, tone={tagPools.tone?.size || 0}</div>
        <div><strong>Scored:</strong> {scored.length} candidates</div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}
      >
        {hydrated.map((img) => (
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
            <button
              onClick={() => handleToggle(img.id)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                fontFamily: 'Parisienne, cursive',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor:
                  galleryRatings[img.id] === 2
                    ? '#d1fae5'
                    : galleryRatings[img.id] === 1
                    ? '#fef9c3'
                    : '#fee2e2',
                color: '#1e3a8a',
                cursor: 'pointer'
              }}
            >
              {LABELS[galleryRatings[img.id] ?? 1]}
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => setView('curated2')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: '#1e3a8a',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ➕ Show Me More Like These
        </button>
      </div>
    </div>
  );
}