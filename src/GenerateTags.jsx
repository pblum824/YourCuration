import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import { analyzeVisualMetadataFromImage } from './utils/analyzeVisualMetadata';

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

  const processImage = async (img) => {
    try {
      logToScreen(`[GenerateTags] Uploading ${img.name}`);
      const formData = new FormData();

      let blob;
      try {
        const response = await fetch(img.url);
        blob = await response.blob();
        formData.append('image', blob, img.name);
      } catch (blobErr) {
        const msg = `[BlobFetch] Failed for ${img.name}: ${blobErr.message}`;
        alert(msg);
        logToScreen(msg);
        throw new Error("Load failed");
      }

      const res = await fetch('https://api.yourcuration.app/batch-tag', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Failed (${res.status})`);

      const result = await res.json();
      const imageTags = result.metadata?.imageTags || [];
      const textTags = result.metadata?.textTags || [];

      let frontendTags = [], visualTone = [], mood = [], colorPalette = [];
      try {
        alert(`[AVM] Starting ${img.name}`);
        const frontendMeta = await analyzeVisualMetadataFromImage(img.url);
        alert(`[AVM] Done ${img.name}`);
        frontendTags = frontendMeta.tags || [];
        visualTone = frontendMeta.dimensions?.visualTone || [];
        mood = frontendMeta.dimensions?.mood || [];
        colorPalette = frontendMeta.dimensions?.colorPalette || [];
      } catch (e) {
        const msg = `[AVM] Failed for ${img.name}: ${e.message}`;
        alert(msg);
        logToScreen(msg);
      }

      return {
        ...img,
        metadata: {
          ...img.metadata,
          imageTags,
          textTags,
          frontendTags,
          toneTags: visualTone,
          moodTags: mood,
          paletteTags: colorPalette
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
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tagged = [];
      for (const img of images) {
        const taggedImg = await processImage(img);
        tagged.push(taggedImg);
      }
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