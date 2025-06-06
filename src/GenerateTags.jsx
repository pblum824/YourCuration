// File: src/GenerateTags.jsx

import React, { useState, useEffect } from 'react';
import { useCuration } from './YourCurationContext';
import { getImageBlob } from './utils/imageCache';
import { rehydrateGallery } from './utils/imageCache';

export default function GenerateTags() {
  const { artistGallery, setArtistGallery } = useCuration();

  const [localGallery, setLocalGallery] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FIRST: restore artistGallery from localStorage
  useEffect(() => {
    async function loadGalleryFromStorage() {
      console.log('🔁 Hydrating artistGallery from localStorage');
      const restored = await rehydrateGallery();
      setArtistGallery(restored);
    }
    loadGalleryFromStorage();
  }, []);

  // ✅ THEN: rehydrate local .file + .url for GT
  useEffect(() => {
    async function rehydrateImages(images) {
      console.log('📦 Stored keys in localStorage:', Object.keys(localStorage));
      const hydrated = await Promise.all(images.map(async (img) => {
        console.log('💡 Attempting rehydration for:', img.name, '| localRefId:', img.localRefId);
        if (!img.localRefId) {
          console.warn('⚠️ Missing localRefId for', img.name);
          return img;
        }
        try {
          const blob = await getImageBlob(img.localRefId);
          const file = new File([blob], img.name || 'image.jpg', {
            type: blob.type || 'image/jpeg'
          });
          const url = URL.createObjectURL(blob);
          return { ...img, file, url };
        } catch (err) {
          console.error('❌ Rehydration failed for', img.name, err);
          return {
            ...img,
            metadata: {
              ...img.metadata,
              error: 'Rehydration failed: ' + err.message
            }
          };
        }
      }));
      setLocalGallery(hydrated);
    }

    rehydrateImages(artistGallery);
  }, [artistGallery]);

  const images = localGallery;

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  const compressImage = (file, maxDim = 384, quality = 0.7) =>
    new Promise((resolve) => {
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

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const uploadable = images.filter(img => img.file);

      if (uploadable.length === 0) {
        logToScreen('[GenerateTags] No uploadable images with file references.');
        return;
      }

      logToScreen(`[GenerateTags] Uploading ${uploadable.length} images`);

      const formData = new FormData();
      for (const img of uploadable) {
        const compressed = await compressImage(img.file);
        formData.append('files', compressed);
      }

      const res = await fetch('https://api.yourcuration.app/batch-tag', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Failed (${res.status})`);

      const result = await res.json();

      const tagged = result.results.map((r, i) => ({
        ...uploadable[i],
        metadata: {
          ...uploadable[i].metadata,
          ...r.metadata,
          imageTags: r.metadata?.imageTags || [],
          textTags: r.metadata?.textTags || [],
          toneTags: r.metadata?.toneTags || [],
          moodTags: r.metadata?.moodTags || [],
          paletteTags: r.metadata?.paletteTags || []
        }
      }));

      setArtistGallery(prev =>
        prev.map(img => tagged.find(t => t.id === img.id) || img)
      );
    } catch (err) {
      logToScreen(`[GenerateTags] Batch error: ${err.message}`);
      const errored = images.map((img) => ({
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
      setArtistGallery(prev =>
        prev.map(img => errored.find(t => t.id === img.id) || img)
      );
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
    minWidth: '96px',
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
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
                  <strong>[{tagType.replace('Tags', '')}]</strong> {img.metadata[tagType].join(', ')}
                </div>
              )
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setArtistGallery(prev => prev.map(photo =>
                  photo.id === img.id ? { ...photo, scrapeEligible: !photo.scrapeEligible } : photo
                ))}
                style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
              >
                {img.scrapeEligible ? 'Accepted' : 'Excluded'}
              </button>
              <button
                onClick={() => setArtistGallery(prev => prev.map(photo =>
                  photo.id === img.id ? { ...photo, galleryEligible: !photo.galleryEligible } : photo
                ))}
                style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
              >
                Gallery
              </button>
              <button
                onClick={() => setArtistGallery(prev => prev.map(photo =>
                  photo.id === img.id ? { ...photo, sampleEligible: !photo.sampleEligible } : photo
                ))}
                style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
              >
                Sample
              </button>
              <button
                onClick={() => setArtistGallery(prev => prev.filter(photo => photo.id !== img.id))}
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