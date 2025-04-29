// GenerateTags.jsx
import React, { useState, useEffect } from 'react';
import { loadImageModelSession } from './utils/onnxHelpers';
import { generateMetadata } from './utils/generateMetadata';

export default function GenerateTags({ setView }) {
  const [images, setImages] = useState([]);
  const [taggedImages, setTaggedImages] = useState([]);
  const [imageModelSession, setImageModelSession] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [logs, setLogs] = useState([]);

  const logToScreen = (message) => setLogs((prev) => [...prev, message]);

  useEffect(() => {
    window.addEventListener('error', (e) => {
      logToScreen(`[Global Error] ${e.message}`);
    });
  }, []);

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
      logToScreen('[GenerateTags] No images found in storage. Skipping redirect for debug.');
    } else {
      logToScreen(`[GenerateTags] Loaded images: ${parsed.length}`);
      setImages(parsed);
    }

    async function loadModels() {
      logToScreen('[GenerateTags] Starting model load...');
      try {
        logToScreen('[GenerateTags] Loading image model...');
        const imageSession = await loadImageModelSession("https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-vit-b32.onnx");
        setImageModelSession(imageSession);
        logToScreen('[CLIP] Image model session loaded');
      } catch (err) {
        logToScreen('[GenerateTags] Failed to load image model');
      }

      setModelsLoaded(true);
      setShowGenerateButton(true);
    }

    loadModels();
  }, []);

  const handleGenerate = async () => {
    try {
      console.log('[GenerateTags] Starting remote tagging...');

      const tagged = await Promise.all(
        images.map(async (img) => {
          console.log('[GenerateTags] Uploading image:', img.name);

          const response = await fetch('/.netlify/functions/tagImage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: img.url })
          });

          if (!response.ok) {
            throw new Error(`Tagging failed for ${img.name}`);
          }

          const { metadata } = await response.json();
          console.log('[GenerateTags] Metadata received for:', img.name, metadata);

          return { ...img, metadata };
        })
      );

      console.log('[GenerateTags] All metadata received, updating localStorage');
      setTaggedImages(tagged);
      localStorage.setItem('yourcuration_artistImages', JSON.stringify(tagged));
      alert('Image-based MetaTags generated and saved!');
    } catch (err) {
      console.error('[GenerateTags] Remote tagging error:', err);
      alert('Something went wrong during tagging. Check console for details.');
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

      {!modelsLoaded && (
        <div>
          <p style={{ fontStyle: 'italic', color: '#666' }}>Loading large tag generator database, please be patient...</p>
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

      {showGenerateButton && (
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