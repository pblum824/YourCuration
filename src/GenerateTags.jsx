// GenerateTags.jsx
import React, { useState, useEffect } from 'react';
import { loadImageModelSession, loadTextModelSession } from './utils/onnxHelpers';
import { generateMetadata } from './utils/generateMetadata';

export default function GenerateTags({ setView }) {
  const [images, setImages] = useState([]);
  const [taggedImages, setTaggedImages] = useState([]);
  const [imageModelSession, setImageModelSession] = useState(null);
  const [textModelSession, setTextModelSession] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);

  useEffect(() => {
    // Load artist images from localStorage
    const stored = localStorage.getItem('yourcuration_artistImages');
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) {
      alert("No images available. Please upload in Artist Dashboard first.");
      setView('dashboard');
    } else {
      setImages(parsed);
    }

    async function loadModels() {
      console.log('[GenerateTags] Starting model load...');

      try {
        console.log('[GenerateTags] Loading image model...');
        //const imageSession = await loadImageModelSession("https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-vit-b32.onnx");
        //setImageModelSession(imageSession);
        //console.log('[CLIP] Image model session loaded');
      } catch (err) {
        console.error('[GenerateTags] Failed to load image model:', err);
      }

      try {
        console.log('[GenerateTags] Loading text model...');
       const textSession = await loadTextModelSession("https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx");
       setTextModelSession(textSession);
       console.log('[CLIP] Text model session loaded');
      } catch (err) {
        console.error('[GenerateTags] Failed to load text model:', err);
      }

      setModelsLoaded(true);
      setShowGenerateButton(true);
    }

    loadModels();
  }, []);

  const handleGenerate = async () => {
    if (!imageModelSession || !textModelSession) {
      alert('Models are not ready yet.');
      return;
    }

    console.log('[GenerateTags] Generating metadata for all images...');
    const tagged = await Promise.all(
      images.map(async (img) => {
        const metadata = await generateMetadata(img.url, null, textModelSession);
        return { ...img, metadata };
      })
    );

    setTaggedImages(tagged);
    localStorage.setItem('yourcuration_artistImages', JSON.stringify(tagged));
    alert('MetaTags generated and saved!');
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
              animation: 'slideProgress 120s linear forwards'
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

      <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '240px' }}>
            <img src={img.url} alt={img.name} style={{ width: '100%', borderRadius: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}