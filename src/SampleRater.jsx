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
    <div className="sample-rater">
      <h2>Which of these speaks to you?</h2>
      <div className="image-row">
        {currentImages.map((img) => (
          <div key={img.id} className="image-card">
            <img src={img.src} alt={`Sample ${img.id}`} />
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  className={ratings.find((r) => r.id === img.id && r.score === score) ? 'selected' : ''}
                  onClick={() => handleRating(img.id, score)}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {hasRatedAll && (
        <button className="next-button" onClick={handleNext}>
          {currentSet < 2 ? 'Next Set' : 'Show My Curated Gallery'}
        </button>
      )}
    </div>
  );
};

export default SampleRater;
