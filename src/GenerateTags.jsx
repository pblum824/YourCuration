import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';

export default function GenerateTags() {
  const {
    artistGallery,
    setArtistGallery
  } = useCuration();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const images = artistGallery.filter(img => img.sampleEligible || img.galleryEligible);

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  async function compressImage(file, maxDim = 384, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        const scale = maxDim / Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
          'image/jpeg',
          quality
        );
      };
      reader.readAsDataURL(file);
    });
  }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      logToScreen(`[GenerateTags] Uploading ${images.length} images`);

      const formData = new FormData();
      for (const img of images) {
        if (!img.file) throw new Error(`Missing file reference for ${img.name}`);
        const compressed = await compressImage(img.file);
        formData.append('files', compressed);
      }

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
          imageTags: r.metadata?.imageTags || images[i].metadata?.imageTags || [],
          textTags: r.metadata?.textTags || images[i].metadata?.textTags || [],
          toneTags: r.metadata?.toneTags || images[i].metadata?.toneTags || [],
          moodTags: r.metadata?.moodTags || images[i].metadata?.moodTags || [],
          paletteTags: r.metadata?.paletteTags || images[i].metadata?.paletteTags || []
        }
      }));

      setArtistGallery(tagged);
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
          error: err.message
        }
      }));
      setArtistGallery(tagged);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id, key) => {
    setArtistGallery(prev =>
      prev.map(img =>
        img.id === id ? { ...img, [key]: !img[key] } : img
      )
    );
  };

  const imageButton = (bg, color = '#1e3a8a') => ({
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: bg,
    color,
    cursor: 'pointer'
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        justifyContent: 'center',
        marginTop: '2rem'
      }}>
        {images.map((img) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{ width: '100%', borderRadius: '0.5rem', maxHeight: '240px', objectFit: 'cover' }}
            />
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => toggle(img.id, 'scrapeEligible')} style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}>
                {img.scrapeEligible ? 'Accepted' : 'Excluded'}
              </button>
              <button onClick={() => toggle(img.id, 'galleryEligible')} style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}>
                Gallery
              </button>
              <button onClick={() => toggle(img.id, 'sampleEligible')} style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}>
                Sample
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