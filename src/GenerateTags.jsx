// GenerateTags.jsx
import React, { useState, useEffect } from 'react';

export default function GenerateTags({ setView }) {
  const [images, setImages] = useState([]);
  const [taggedImages, setTaggedImages] = useState([]);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logToScreen = (message) => setLogs((prev) => [...prev, message]);

  useEffect(() => {
    const stored = localStorage.getItem('yourcuration_artistImages');
    let parsed = [];

    try {
      parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) parsed = [];
    } catch (err) {
      logToScreen('[GenerateTags] Failed to parse localStorage');
      parsed = [];
    }

    if (parsed.length === 0) {
      logToScreen('[GenerateTags] No images found in storage.');
    } else {
      logToScreen(`[GenerateTags] Loaded images: ${parsed.length}`);
      setImages(parsed);
      setShowGenerateButton(true);
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tagged = await Promise.all(
        images.map(async (img) => {
          logToScreen(`[GenerateTags] Uploading image: ${img.name}`);

          const blob = await fetch(img.url).then(res => res.blob());
          const formData = new FormData();
          formData.append('image', blob, img.name);

          const response = await fetch('http://44.223.11.189:3000/batch-tag', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Tagging failed for ${img.name}`);
          }

          const { tags } = await response.json();
          logToScreen(`[GenerateTags] Metadata received for: ${img.name}`);
          return { ...img, metadata: { tags } };
        })
      );

      setTaggedImages(tagged);
      localStorage.setItem('yourcuration_artistImages', JSON.stringify(tagged));
      alert('MetaTags generated and saved!');
    } catch (err) {
      console.error('[GenerateTags] Remote tagging error:', err);
      alert('Something went wrong during tagging. Check logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <style>
        {`
          @keyframes slideProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
          }
        `}
      </style>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>Generate Tags</h2>

      {loading && (
        <div>
          <p style={{ fontStyle: 'italic', color: '#666' }}>Tagging images, please wait...</p>
          <div style={{ width: '80%', margin: '1rem auto', background: '#eee', borderRadius: '1rem', overflow: 'hidden' }}>
            <div style={{
              width: '100%',
              height: '1rem',
              background: '#1e3a8a',
              transform: 'translateX(-100%)',
              animation: 'slideProgress 180s linear forwards'
            }}></div>
          </div>
        </div>
      )}

      {showGenerateButton && !loading && (
        <button
          onClick={handleGenerate}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#1e3a8a', color: 'white', cursor: 'pointer' }}
        >
          Generate MetaTags
        </button>
      )}

      <div style={{ marginTop: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: '0.85rem', color: '#333', marginBottom: '0.25rem' }}>📝 {log}</div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {(taggedImages.length > 0 ? taggedImages : images)?.map((img) => (
          <div key={img.id} style={{ width: '240px' }}>
            <img src={img.url} alt={img.name} style={{ width: '100%', borderRadius: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>
            {img.metadata?.tags && (
              <div style={{ fontSize: '0.8rem', color: '#444', marginTop: '0.5rem' }}>
                <strong>Tags:</strong> {img.metadata.tags.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
