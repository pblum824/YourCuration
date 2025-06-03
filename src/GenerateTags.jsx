// File: src/GenerateTags.jsx
import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';
import EditableTagSection from './EditableTagSection';
import { loadImageBlob } from './utils/imageCache';

export default function GenerateTags() {
  const {
    artistGallery,
    setArtistGallery,
    updateImageMetadata,
  } = useCuration();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const images = artistGallery.filter(img => img.sampleEligible || img.galleryEligible);
  const setImages = setArtistGallery;

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      logToScreen(`[GenerateTags] Uploading ${images.length} images`);
      const formData = new FormData();
      for (const img of images) {
        const blob = loadImageBlob(img.localRefId);
        if (!blob) throw new Error(`Missing file reference for ${img.name}`);
        const file = new File([blob], img.name, { type: 'image/jpeg' });
        formData.append('files', file);
      }

      // 🚨 DO NOT MODIFY THIS BLOCK
      // These files are compressed and stored at upload time.
      // This logic uses previously validated compression settings.
      // Do not change format, resolution, or quality — it's optimized for inferencing performance.

      const res = await fetch('https://api.yourcuration.app/batch-tag', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const result = await res.json();
      const tagged = result.results.map((r, i) => ({
        ...images[i],
        metadata: {
          ...images[i].metadata,
          ...r.metadata,
        },
      }));
      setImages(tagged);
    } catch (err) {
      logToScreen(`[GenerateTags] Batch error: ${err.message}`);
      const tagged = images.map((img) => ({
        ...img,
        metadata: {
          ...img.metadata,
          imageTags: [],
          textTags: [],
          toneTags: [],
          moodTags: [],
          paletteTags: [],
          error: err.message,
        },
      }));
      setImages(tagged);
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSample = (id) =>
    setArtistGallery(prev =>
      prev.map(img =>
        img.id === id ? { ...img, sampleEligible: !img.sampleEligible } : img
      )
    );

  const toggleImageGallery = (id) =>
    setArtistGallery(prev =>
      prev.map(img =>
        img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img
      )
    );

  const toggleImageScrape = (id) =>
    setArtistGallery(prev =>
      prev.map(img =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );

  const removeImage = (id) =>
    setArtistGallery(prev => prev.filter(img => img.id !== id));

  const imageButton = (bg, color = '#1e3a8a') => ({
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: bg,
    color: color,
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: '2rem' }}>
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

            <EditableTagSection
              imageId={img.id}
              initialTags={img.metadata.imageTags || []}
            />

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => toggleImageScrape(img.id)} style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}>
                {img.scrapeEligible ? 'Accepted' : 'Excluded'}
              </button>
              <button onClick={() => toggleImageGallery(img.id)} style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}>
                Gallery
              </button>
              <button onClick={() => toggleImageSample(img.id)} style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}>
                Sample
              </button>
              <button onClick={() => removeImage(img.id)} style={imageButton('#fee2e2', '#991b1b')}>
                Remove
              </button>
            </div>

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
