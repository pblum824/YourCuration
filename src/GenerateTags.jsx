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
      try {
        logToScreen(`[GenerateTags] Uploading ${images.length} images`);

        const formData = new FormData();
        images.forEach((img) => {
          if (!img.file) throw new Error(`Missing file reference for ${img.name}`);
          formData.append('files', img.file);
        });

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
            imageTags: r.metadata?.imageTags || [],
            textTags: r.metadata?.textTags || [],
            toneTags: r.metadata?.toneTags || [],
            moodTags: r.metadata?.moodTags || [],
            paletteTags: r.metadata?.paletteTags || []
          }
        }));

        setImages(prev => prev.map(img => tagged.find(t => t.id === img.id) || img));
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
        setImages(prev => prev.map(img => tagged.find(t => t.id === img.id) || img));
      }
    } finally {
      setLoading(false);
    }
  };

  const imageButton = (bg, color = '#1e3a8a') => ({
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: bg,
    color,
    cursor: 'pointer',
    minWidth: '96px'
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setTarget('samples')} style={imageButton(target === 'samples' ? '#dbeafe' : '#f3f4f6')}>
          Use Samples
        </button>
        <button onClick={() => setTarget('gallery')} style={imageButton(target === 'gallery' ? '#dbeafe' : '#f3f4f6')}>
          Use Gallery
        </button>
        <button onClick={handleGenerate} disabled={loading} style={{ padding: '0.75rem 1.25rem' }}>
          {loading ? 'Generating Tags...' : 'Generate MetaTags'}
        </button>
      </div>

      <div style={{ marginTop: '1rem', fontFamily: 'monospace' }}>
        {logs.map((log, i) => (
          <div key={i}>📝 {log}</div>
        ))}
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center',
        marginTop: '2rem'
      }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '280px', textAlign: 'center' }}>
            <img src={img.url} alt={img.name} style={{ width: '100%', borderRadius: '0.5rem' }} />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>

            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
              <strong>Tags (editable)</strong>
            </div>

            {img.metadata?.error && (
              <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <strong>Error:</strong> {img.metadata.error}
              </div>
            )}

            {['imageTags', 'textTags', 'toneTags', 'moodTags', 'paletteTags'].map(tagType => (
              img.metadata?.[tagType]?.length > 0 && (
                <div key={tagType} style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  <strong>[{tagType.replace('Tags','')}]</strong> {img.metadata[tagType].join(', ')}
                </div>
              )
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setImages(prev => prev.map(photo => photo.id === img.id ? { ...photo, scrapeEligible: !photo.scrapeEligible } : photo))}
                style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
              >
                {img.scrapeEligible ? 'Accepted' : 'Excluded'}
              </button>
              <button
                onClick={() => setImages(prev => prev.map(photo => photo.id === img.id ? { ...photo, galleryEligible: !photo.galleryEligible } : photo))}
                style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
              >
                Gallery
              </button>
              <button
                onClick={() => setImages(prev => prev.map(photo => photo.id === img.id ? { ...photo, sampleEligible: !photo.sampleEligible } : photo))}
                style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
              >
                Sample
              </button>
              <button
                onClick={() => setImages(prev => prev.filter(photo => photo.id !== img.id))}
                style={imageButton('#fee2e2', '#991b1b')}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}