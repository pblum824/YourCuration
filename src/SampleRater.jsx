import React, { useState, useEffect } from 'react';
import './SampleRater.css';
import generateMetadata from './utils/generateMetadata';

const sampleImages = Array.from({ length: 9 }, (_, i) => {
  const image = generateMetadata(i + 1);
  return {
    ...image,
    src: `/samples/sample${i + 1}.jpg`,
  };
});

const SampleRater = ({ onComplete }) => {
  const [currentSet, setCurrentSet] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsWide(window.innerWidth >= 768);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleRating = (id, score) => {
    const metadata = sampleImages.find(img => img.id === id)?.metadata;
    setRatings((prev) => {
      const updated = [...prev.filter((r) => r.id !== id), { id, score, metadata }];
      return updated;
    });
  };

  const handleNext = () => {
    if (currentSet < 2) {
      setCurrentSet(currentSet + 1);
    } else {
      onComplete(ratings);
    }
  };

  const currentImages = sampleImages.slice(currentSet * 3, currentSet * 3 + 3);
  const hasRatedAll = currentImages.every((img) => ratings.find((r) => r.id === img.id));

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
        Which of these speaks to you?
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: isWide ? 'row' : 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '3rem',
          flexWrap: 'wrap',
        }}
      >
        {currentImages.map((img) => (
          <div key={img.id} style={{ maxWidth: '340px', textAlign: 'center' }}>
            <img
              src={img.src}
              alt={`Sample ${img.id}`}
              style={{
                maxWidth: '320px',
                width: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                objectFit: 'cover',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              {[{ label: 'OK', score: 1 }, { label: 'Good', score: 2 }, { label: 'Love', score: 3 }].map(
                ({ label, score }) => (
                  <button
                    key={label}
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '1.5rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      border: '1px solid #ccc',
                      backgroundColor:
                        ratings.find((r) => r.id === img.id && r.score === score)
                          ? '#bfdbfe'
                          : '#fff',
                      fontFamily: 'Parisienne, cursive'
                    }}
                    onClick={() => handleRating(img.id, score)}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            {/* Optional debug: show tags */}
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
              Tags: {img?.metadata?.tags?.join(', ')}
            </p>
          </div>
        ))}
      </div>

      {hasRatedAll && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            style={{
              padding: '1.25rem 2.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '1.75rem',
              borderRadius: '1rem',
              fontFamily: 'Parisienne, cursive',
              boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={handleNext}
          >
            {currentSet < 2 ? 'Next Set' : 'Show My Curated Gallery'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SampleRater;