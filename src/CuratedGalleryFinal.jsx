// File: src/CuratedGalleryFinal.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import { aggregateSampleTags, extractAllTags, scoreImage } from './utils/scoreImage';
import ControlBar from './utils/ControlBar';

export default function CuratedGalleryFinal({ setView }) {
  const {
    artistGallery = [],
    ratings = {},
    cg1Selections = {},
    cg2Selections = {},
    mode,
    devMode,
    setDevMode,
  } = useCuration();

  const [finalGallery, setFinalGallery] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function hydrate() {
      try {
        const samples = artistGallery.filter((img) => ratings[img.id]);
        const tagPools = aggregateSampleTags(samples, ratings);

        const scored = artistGallery
          .filter((img) => img.galleryEligible)
          .map((img) => {
            const tags = extractAllTags(img.metadata);
            const tagScore = Math.round(scoreImage(img, tagPools) * 6); // normalize to 0–6
            const loveScore = ratings[img.id] === 'love' ? 3 : 0;
            const cg1Score = cg1Selections[img.id] === 2 ? 2 : 0;
            const cg2Score = cg2Selections[img.id] === 2 ? 2 : 0;
            const totalScore = loveScore + cg1Score + cg2Score + tagScore;
            return { ...img, score: totalScore, tagScore };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);

        const hydrated = await Promise.all(
          scored.map(async (img) => {
            try {
              const blob = await loadBlob(img.localRefId);
              const url = URL.createObjectURL(blob);
              return { ...img, url };
            } catch {
              return { ...img, url: '' };
            }
          })
        );

        setFinalGallery(hydrated);
      } catch (err) {
        setError(err.message || 'Failed to generate final gallery.');
      }
    }

    hydrate();
  }, [artistGallery, ratings, cg1Selections, cg2Selections]);

  const exportGallery = async () => {
    const images = await Promise.all(
      finalGallery.map(async (img) => {
        const blob = await loadBlob(img.localRefId);
        const base64 = await blobToBase64(blob);
        return {
          name: img.name,
          data: base64,
          scrapeEligible: img.scrapeEligible,
          galleryEligible: img.galleryEligible,
          sampleEligible: img.sampleEligible,
          metadata: img.metadata || {},
        };
      })
    );

    const bundle = {
      timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
      images,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `YourCuration-Gallery-${bundle.timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        ❌ CGF Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <ControlBar view="curatedFinal" setView={setView} devMode={devMode} setDevMode={setDevMode} />

      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Curated Gallery Final
      </h2>

      <button
        onClick={exportGallery}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          backgroundColor: '#f0fdfa',
          cursor: 'pointer',
        }}
      >
        Export Final Gallery
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        {finalGallery.map((img) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            {img.url ? (
              <img
                src={img.url}
                alt={img.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontStyle: 'italic',
                }}
              >
                image not loaded
              </div>
            )}
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
            {devMode && (
              <p style={{ fontSize: '0.75rem', color: '#666' }}>
                Score: {img.score} (Tags: {img.tagScore})
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to convert blob'));
    reader.readAsDataURL(blob);
  });
}