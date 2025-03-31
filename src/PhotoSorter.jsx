import React, { useState, useEffect } from 'react';
import './PhotoSorter.css';

const photos = [
  { id: 1, url: '/photos/photo1.jpg', tags: ['warm', 'sunset'] },
  { id: 2, url: '/photos/photo2.jpg', tags: ['moody', 'fog'] },
  { id: 3, url: '/photos/photo3.jpg', tags: ['bright', 'ocean'] },
  { id: 4, url: '/photos/photo4.jpg', tags: ['minimal', 'blue'] },
  { id: 5, url: '/photos/photo5.jpg', tags: ['abstract', 'yellow'] },
  { id: 6, url: '/photos/photo6.jpg', tags: ['cool', 'night'] },
];

export default function PhotoSorter() {
  const [index, setIndex] = useState(0);
  const [preference, setPreference] = useState([]);
  const [selections, setSelections] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [refineMode, setRefineMode] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const [useAIRefinement, setUseAIRefinement] = useState(false);
  const [refinementOptions, setRefinementOptions] = useState([]);
  const [themeTone, setThemeTone] = useState('light');
  const [fontStyle, setFontStyle] = useState('sans');

  useEffect(() => {
    const savedRefinements = localStorage.getItem('refinementOptions');
    if (savedRefinements) setRefinementOptions(JSON.parse(savedRefinements));
    const savedTheme = localStorage.getItem('themeTone');
    const savedFont = localStorage.getItem('fontStyle');
    if (savedTheme) setThemeTone(savedTheme);
    if (savedFont) setFontStyle(savedFont);
  }, []);

  const handleNext = () => {
    if (preference.length === 3) {
      setSelections([...selections, preference]);
      setPreference([]);
      const nextIndex = index + 3;
      if (nextIndex >= photos.length) {
        setShowRecommendations(true);
      } else {
        setIndex(nextIndex);
      }
    }
  };

  const togglePreference = (id) => {
    if (preference.includes(id)) {
      setPreference(preference.filter(pid => pid !== id));
    } else if (preference.length < 3) {
      setPreference([...preference, id]);
    }
  };

  const scoreMap = {};
  selections.forEach(set => {
    set.forEach((id, idx) => {
      scoreMap[id] = (scoreMap[id] || 0) + (3 - idx);
    });
  });

  const boostPhotosByFeedback = (photos, feedback) => {
    const keywords = feedback.toLowerCase().split(/\s+/);
    return photos.map(photo => {
      const matches = photo.tags.filter(tag => keywords.includes(tag)).length;
      const boost = matches * 2;
      return { ...photo, adjustedScore: (scoreMap[photo.id] || 0) + boost };
    });
  };

  const recommendedPhotos = useAIRefinement
    ? boostPhotosByFeedback([...photos].filter(p => scoreMap[p.id]), userFeedback).sort((a, b) => b.adjustedScore - a.adjustedScore)
    : [...photos].filter(p => scoreMap[p.id]).sort((a, b) => (scoreMap[b.id] || 0) - (scoreMap[a.id] || 0));

  const labels = ['Love', 'Really Like', 'Like'];
  const currentSet = photos.slice(index, index + 3);

  if (currentSet.length === 0 && !showRecommendations) {
    setShowRecommendations(true);
    return null;
  }

  if (showRecommendations && !refineMode) {
    return (
      <div className={`photo-sorter ${themeTone}-theme ${fontStyle}-font`}>
        <h2>Here’s what we think you’ll love most</h2>
        <div className="photo-grid">
          {recommendedPhotos.map(photo => (
            <div key={photo.id} className="photo-card">
              <img src={photo.url} alt={`Photo ${photo.id}`} className="photo-image" />
            </div>
          ))}
        </div>
        <div className="feedback-section">
          <h3>Do these photographs move you?</h3>
          <p>You can help us refine what we show you next.</p>
          <div className="refinement-buttons">
            {refinementOptions.map((option, idx) => (
              <button key={idx} onClick={() => alert(`You chose: ${option}`)}>{option}</button>
            ))}
          </div>
          <textarea
            placeholder="Or share your thoughts..."
            rows={3}
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
          />
          <div className="refine-actions">
            <button onClick={() => setRefineMode(true)}>Refine With Artist</button>
            <button onClick={() => { setRefineMode(true); setUseAIRefinement(true); }}>Refine With AI</button>
          </div>
        </div>
      </div>
    );
  }

  if (refineMode) {
    return (
      <div className={`photo-sorter ${themeTone}-theme ${fontStyle}-font`}>
        <h2>Wonderful!</h2>
        <p>Your reflections have been shared with the artist for a more personalized journey.</p>
      </div>
    );
  }

  return (
    <div className={`photo-sorter ${themeTone}-theme ${fontStyle}-font`}>
      <div className="photo-grid">
        {currentSet.map(photo => {
          const rankIndex = preference.indexOf(photo.id);
          return (
            <div
              key={photo.id}
              className={`photo-card ${rankIndex !== -1 ? 'selected' : ''}`}
              onClick={() => togglePreference(photo.id)}
            >
              <img src={photo.url} alt={`Photo ${photo.id}`} className="photo-image" />
              <p>{rankIndex !== -1 ? labels[rankIndex] : 'Tap to choose'}</p>
            </div>
          );
        })}
      </div>
      <div className="sorter-actions">
        <button disabled={preference.length !== 3} onClick={handleNext}>Show Me More I Might Love</button>
        <p>(Tap photos in the order that feels most inspiring to you)</p>
      </div>
    </div>
  );
}