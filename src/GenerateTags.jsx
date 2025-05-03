// GenerateTags.jsx
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function GenerateTags({ setView }) {
  const [images, setImages] = useState([]);
  const [taggedImages, setTaggedImages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logToScreen = (message) => setLogs((prev) => [...prev, message]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const prepared = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prepared);
    setTaggedImages([]);
    setLogs([]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tagged = await Promise.all(
        images.map(async (img) => {
          try {
            logToScreen(`[GenerateTags] Uploading image: ${img.name}`);

            const blob = img.file;
            const formData = new FormData();
            formData.append('image', blob, img.name);

            const response = await fetch('http://44.223.11.189:3000/batch-tag', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error(`Tagging failed with status ${response.status}`);
            }

            const result = await response.json();
            const imageTags = result.metadata?.imageTags || [];
            const textTags = result.metadata?.textTags || [];
            logToScreen(`[GenerateTags] Metadata received for: ${img.name}`);
            return { ...img, metadata: { imageTags, textTags } };
          } catch (error) {
            logToScreen(`[GenerateTags] Error tagging ${img.name}: ${error.message}`);
            return { ...img, metadata: { imageTags: [], textTags: [], error: error.message } };
          }
        })
      );

      setTaggedImages(tagged);

      const successCount = tagged.filter(img => !img.metadata?.error).length;
      if (successCount === tagged.length) {
        alert('MetaTags generated and saved!');
      } else {
        alert('Some images failed to generate tags. Check logs.');
      }
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

      <input type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ marginBottom: '1rem' }} />

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

      {images.length > 0 && !loading && (
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
            {img.metadata?.imageTags?.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#444', marginTop: '0.5rem' }}>
                <strong>Image Tags:</strong> {img.metadata.imageTags.join(', ')}
              </div>
            )}
            {img.metadata?.textTags?.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#444', marginTop: '0.5rem' }}>
                <strong>Text Tags:</strong> {img.metadata.textTags.join(', ')}
              </div>
            )}
            {img.metadata?.error && (
              <div style={{ fontSize: '0.75rem', color: 'red', marginTop: '0.5rem' }}>
                <strong>Error:</strong> {img.metadata.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
