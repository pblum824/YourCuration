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

  useEffect(() => {
    window.addEventListener('error', (e) => {
      console.error('[Global Error]', e.message, e);
    });
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem('yourcuration_artistImages');
    let parsed = [];

    try {
      parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) parsed = [];
    } catch (err) {
      console.error('[GenerateTags] Failed to parse localStorage:', err);
      parsed = [];
    }

    if (parsed.length === 0) {
      console.warn('[GenerateTags] No images found in storage. Redirecting to dashboard.');
      alert("No images available. Please upload in Artist Dashboard first.");
      setView('dashboard');
      console.log('[GenerateTags] REDIRECT TRIGGERED: parsed.length = 0');
      if (parsed.length === 0) {
        console.warn('[GenerateTags] No images found. Redirect skipped for debug.');
        alert("No images available. Please upload in Artist Dashboard first.");
        // setView('dashboard');  // ← temporarily disable this for debugging
      }
    } else {
      console.log('[GenerateTags] Loaded images:', parsed.length, parsed);
      setImages(parsed);
    }

    async function loadModels() {
      console.log('[GenerateTags] Starting model load...');
      try {
        console.log('[GenerateTags] Loading image model...');
        const imageSession = await loadImageModelSession("https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-vit-b32.onnx");
        setImageModelSession(imageSession);
        console.log('[CLIP] Image model session loaded');
      } catch (err) {
        console.error('[GenerateTags] Failed to load image model:', err);
      }

      setModelsLoaded(true);
      setShowGenerateButton(true);
    }

    loadModels();
  }, []);
  const imageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch image blob');
          return res.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject('Failed to read image blob');
          reader.readAsDataURL(blob);
        })
        .catch((err) => {
          console.error('[imageToBase64] Error:', err);
          reject(err);
        });
    });
  };
    const handleGenerate = async () => {
      if (!imageModelSession) {
        alert('Image model not ready.');
        return;
      }

      try {
        console.log('[GenerateTags] Starting metadata tagging...');
        const tagged = await Promise.all(
          images.map(async (img) => {
            console.log('[GenerateTags] Tagging image:', img.name, img.url);

            const metadata = await generateMetadata(String(img.url), imageModelSession, null);

            console.log('[GenerateTags] Metadata returned:', metadata);

            return {
              ...img,
              metadata
            };
          })
        );

        console.log('[GenerateTags] Final tagged data:', tagged);
        setTaggedImages(tagged);
        localStorage.setItem('yourcuration_artistImages', JSON.stringify(tagged));
        alert('Image-based MetaTags generated and saved!');
      } catch (err) {
        console.error('[GenerateTags] ERROR during tagging:', err);
        alert('Something went wrong during tag generation. Check the console.');
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
