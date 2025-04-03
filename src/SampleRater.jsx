import React, { useState } from 'react';
import './SampleRater.css';

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

const SampleRater = ({ onComplete }) => {
  const [currentSet, setCurrentSet] = useState(0);
  const [ratings, setRatings] = useState([]);

  const handleRating = (id, score) => {
    setRatings((prev) => {
      const updated = [...prev.filter((r) => r.id !== id), { id, score }];
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
    <div className="sample-rater space-y-10">
      <h2 className="text-2xl font-semibold text-center">Which of these speaks to you?</h2>

      <div className="flex flex-wrap justify-center gap-10">
        {currentImages.map((img) => (
          <div key={img.id} className="flex flex-col items-center space-y-4">
            <img
              src={img.src}
              alt={`Sample ${img.id}`}
              style={{
                maxWidth: '280px',
                width: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                objectFit: 'cover'
              }}
            />
            <div className="flex gap-4">
              {[{ label: 'OK', score: 1 }, { label: 'Good', score: 2 }, { label: 'Love', score: 3 }].map(
                ({ label, score }) => (
                  <button
                    key={label}
                    className={`px-5 py-3 text-xl rounded-md shadow-sm border font-parisienne ${
                      ratings.find((r) => r.id === img.id && r.score === score)
                        ? 'bg-blue-100'
                        : 'bg-white'
                    }`}
                    onClick={() => handleRating(img.id, score)}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {hasRatedAll && (
        <div className="text-center">
          <button
            className="mt-8 px-8 py-4 bg-primary text-white rounded-xl shadow font-parisienne text-xl hover:bg-primary/90 transition"
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