import React, { useEffect, useState } from 'react';
import './ArtistDashboard.css';

const photos = [
  { id: 1, url: '/photos/photo1.jpg' },
  { id: 2, url: '/photos/photo2.jpg' },
  { id: 3, url: '/photos/photo3.jpg' },
  { id: 4, url: '/photos/photo4.jpg' },
  { id: 5, url: '/photos/photo5.jpg' },
  { id: 6, url: '/photos/photo6.jpg' },
];

export default function ArtistDashboard() {
  const [logo, setLogo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [themeTone, setThemeTone] = useState('light');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [refinementOptions, setRefinementOptions] = useState([]);
  const [newRefinement, setNewRefinement] = useState('');
  const [fontStyle, setFontStyle] = useState('sans');

  useEffect(() => {
    setLogo(localStorage.getItem('artistLogo'));
    setHeroImage(localStorage.getItem('heroImage'));
    setThemeTone(localStorage.getItem('themeTone') || 'light');
    setWatermarkPosition(localStorage.getItem('watermarkPosition') || 'bottom-right');
    setFontStyle(localStorage.getItem('fontStyle') || 'sans');
    const savedRefinements = localStorage.getItem('refinementOptions');
    if (savedRefinements) setRefinementOptions(JSON.parse(savedRefinements));
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('artistLogo', reader.result);
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroSelect = (url) => {
    setHeroImage(url);
    localStorage.setItem('heroImage', url);
  };

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setThemeTone(theme);
    localStorage.setItem('themeTone', theme);
  };

  const handleFontChange = (e) => {
    const font = e.target.value;
    setFontStyle(font);
    localStorage.setItem('fontStyle', font);
  };

  const handleWatermarkPosition = (e) => {
    const pos = e.target.value;
    setWatermarkPosition(pos);
    localStorage.setItem('watermarkPosition', pos);
  };

  const handleAddRefinement = () => {
    if (newRefinement.trim()) {
      const updated = [...refinementOptions, newRefinement.trim()];
      setRefinementOptions(updated);
      localStorage.setItem('refinementOptions', JSON.stringify(updated));
      setNewRefinement('');
    }
  };

  const handleRemoveRefinement = (option) => {
    const updated = refinementOptions.filter(opt => opt !== option);
    setRefinementOptions(updated);
    localStorage.setItem('refinementOptions', JSON.stringify(updated));
  };

  const themeClass = `${themeTone}-theme ${fontStyle}-font`;

  return (
    <div className={`artist-dashboard ${themeClass}`}>
      <h2>YourCuration – Artist Dashboard</h2>

      <div className="section">
        <h4>Upload Your Logo</h4>
        <input type="file" accept="image/*" onChange={handleLogoUpload} />
        {logo && <img src={logo} alt="Logo Preview" className="logo-preview" />}
      </div>

      <div className="section">
        <h4>Select Hero Image</h4>
        <div className="photo-thumbs">
          {photos.map(photo => (
            <img
              key={photo.id}
              src={photo.url}
              alt="Hero"
              className={heroImage === photo.url ? 'selected' : ''}
              onClick={() => handleHeroSelect(photo.url)}
            />
          ))}
        </div>
      </div>

      <div className="section">
        <h4>Theme Tone</h4>
        <select value={themeTone} onChange={handleThemeChange}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="warm">Soft Warm</option>
          <option value="cool">Muted Cool</option>
          <option value="minimalist">Minimalist</option>
        </select>
      </div>

      <div className="section">
        <h4>Font Style</h4>
        <select value={fontStyle} onChange={handleFontChange}>
          <option value="sans">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
          <option value="elegant">Elegant</option>
          <option value="expressive">Expressive</option>
        </select>
      </div>

      <div className="section">
        <h4>Watermark Position</h4>
        <select value={watermarkPosition} onChange={handleWatermarkPosition}>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
          <option value="center">Center</option>
        </select>
      </div>

      <div className="section">
        <h4>Refinement Options</h4>
        <input
          type="text"
          value={newRefinement}
          onChange={(e) => setNewRefinement(e.target.value)}
          placeholder="Add a new keyword..."
        />
        <button onClick={handleAddRefinement}>Add</button>
        <ul>
          {refinementOptions.map((opt, idx) => (
            <li key={idx}>
              {opt} <button onClick={() => handleRemoveRefinement(opt)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

