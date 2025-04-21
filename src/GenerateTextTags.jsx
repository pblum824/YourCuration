// GenerateTextTags.jsx
import React, { useState, useEffect } from 'react';
import { loadTextModelSession } from './utils/onnxHelpers';
import { generateMetadata } from './utils/generateMetadata';

export default function GenerateTextTags({ setView }) {
  const [images, setImages] = useState([]);
  const [taggedImages, setTaggedImages] = useState([]);
  const [textModelSession, setTextModelSession] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('yourcuration_artistImages');
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) {
      alert("No images available. Please upload in Artist Dashboard first.");
      setView('dashboard');
    } else {
      setImages(parsed);
    }

    async function loadModel() {
      try {
        console.log('[GenerateTextTags] Loading text model...');
        const textSession = await loadTextModelSession("https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx");
        setTextModelSession(textSession);
        setModelsLoaded(true);
        setShowGenerateButton(true);
        console.log('[CLIP] Text model session loaded');
      } catch (err) {
        console.error('[GenerateTextTags] Failed to load text model:', err);
      }
    }

    loadModel();
  }, []);

  const handleGenerate = async () => {
    if (!textModelSession) {
      alert('Model not ready.');
      return;
    }

    console.log('[GenerateTextTags] Generating metadata for all images...');
    const tagged = await Promise.all(
      images.map(async (img) => {
        const metadata = await generateMetadata(img.url, null, textModelSession);
        return { ...img, metadata: {
          ...img.metadata,
          tags: Array.from(new Set([...(img.metadata?.tags || []), ...(metadata?.tags || [])])),
          dimensions: img.metadata?.dimensions || {},
          dominantHue: img.metadata?.dominantHue ?? null
        }};
      })
    );

    setTaggedImages(tagged);
    localStorage.setItem('yourcuration_artistImages', JSON.stringify(tagged));
    alert('Text-based MetaTags generated and saved!');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>Generate Text Tags</h2>

      {!modelsLoaded && (
        <p style={{ fontStyle: 'italic', color: '#666' }}>Loading tag prompt engine...</p>
      )}

      {showGenerateButton && (
        <>
          <button
            onClick={handleGenerate}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#1e3a8a', color: 'white', cursor: 'pointer' }}
          >
            Generate MetaTags
          </button>

          {taggedImages.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                Your image tags have been saved. Now you’re ready to add text-based tags.
              </p>
              <button
                onClick={() => setView('text')}
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#e0f2fe', color: '#075985', cursor: 'pointer' }}
              >
                Add Text Tags →
              </button>
            </div>
          )}
        </>
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
