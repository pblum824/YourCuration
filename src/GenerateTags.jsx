import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';

export default function GenerateTags() {
  const {
    artistSamples,
    setArtistSamples,
    artistGallery,
    setArtistGallery
  } = useCuration();

  const [target, setTarget] = useState('samples');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const images = target === 'samples' ? artistSamples : artistGallery;
  const setImages = target === 'samples' ? setArtistSamples : setArtistGallery;

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tagged = await Promise.all(
        images.map(async (img) => {
          try {
            logToScreen(`[GenerateTags] Uploading ${img.name}`);
            const formData = new FormData();
            logToScreen(`[GenerateTags] Fetching image blob from: ${img.url}`);
            const response = await fetch(img.url);
            if (!response.ok) throw new Error(`Image fetch failed (${response.status})`);
            logToScreen(`[GenerateTags] Image fetch OK: ${img.name}`);
            const blob = await response.blob();
            const fileType = blob.type || 'image/jpeg';
            const file = new File([blob], img.name, { type: fileType });
            formData.append('image', file);

            const res = await fetch('https://api.yourcuration.app/visual-tag', {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) throw new Error(`Failed (${res.status})`);

            const result = await res.json();
            const imageTags = result.imageTags || [];
            const textTags = result.textTags || [];
            const frontendTags = result.frontendTags || [];
            const toneTags = result.toneTags || [];
            const moodTags = result.moodTags || [];
            const paletteTags = result.paletteTags || [];

            return {
              ...img,
              metadata: {
                ...img.metadata,
                imageTags,
                textTags,
                frontendTags,
                toneTags,
                moodTags,
                paletteTags
              }
            };
          } catch (err) {
            logToScreen(`[GenerateTags] Failed for ${img.name}: ${err.message}`);
            return {
              ...img,
              metadata: {
                ...img.metadata,
                imageTags: [],
                textTags: [],
                frontendTags: [],
                toneTags: [],
                moodTags: [],
                paletteTags: [],
                error: err.message
              }
            };
          }
        })
      );

      setImages(tagged);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <label style={{ marginRight: '1rem' }}>Tagging Target:</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{ padding: '0.75rem 1.25rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc', backgroundColor: '#fff' }}
        >
          <option value="samples">Sample Images</option>
          <option value="gallery">Gallery Images</option>
        </select>
      </div>

      <button onClick={handleGenerate} disabled={loading} style={{ padding: '0.75rem 1.25rem' }}>
        {loading ? 'Generating Tags...' : 'Generate MetaTags'}
      </button>

      <div style={{ marginTop: '1rem', fontFamily: 'monospace' }}>
        {logs.map((log, i) => (
          <div key={i}>📝 {log}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '280px', textAlign: 'center' }}>
            <img src={img.url} alt={img.name} style={{ width: '100%', borderRadius: '0.5rem' }} />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>

            {img.metadata?.imageTags?.length > 0 && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>[image]</strong> {img.metadata.imageTags.join(', ')}
              </div>
            )}
            {img.metadata?.textTags?.length > 0 && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>[text]</strong> {img.metadata.textTags.join(', ')}
              </div>
            )}
            {img.metadata?.frontendTags?.length > 0 && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>[frontend]</strong> {img.metadata.frontendTags.join(', ')}
              </div>
            )}
            {img.metadata?.toneTags?.length > 0 && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>[tone]</strong> {img.metadata.toneTags.join(', ')}
              </div>
            )}
            {img.metadata?.moodTags?.length > 0 && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>[mood]</strong> {img.metadata.moodTags.join(', ')}
              </div>
            )}
            {img.metadata?.paletteTags?.length > 0 && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>[palette]</strong> {img.metadata.paletteTags.join(', ')}
              </div>
            )}
            {img.metadata?.error && (
              <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                <strong>Error:</strong> {img.metadata.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}