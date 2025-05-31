// File: src/SampleRater.jsx
import React, { useState } from 'react';
import './SampleRater.css';

const SAMPLE_OPTIONS = ['love', 'like', 'less'];
const COLORS = {
  love: '#d1fae5',
  like: '#dbeafe',
  less: '#fed7aa',
};
const ACTIVE_COLORS = {
  love: '#34d399',
  like: '#60a5fa',
  less: '#f97316',
};

export default function SampleRater({ images }) {
  const [ratings, setRatings] = useState({});

  const setRating = (id, value) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      {images.map((img) => {
        const rating = ratings[img.id];
        return (
          <div key={img.id} style={{ width: '280px', textAlign: 'center' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {SAMPLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setRating(img.id, option)}
                  className={`rate-btn ${rating === option ? 'selected ' + option : option}`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}