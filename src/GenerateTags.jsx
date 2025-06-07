// File: src/GenerateTags.jsx

import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import EditableTagList from './EditableTagList';

export default function GenerateTags() {
  const { artistGallery, setArtistGallery } = useCuration();

  const [localGallery, setLocalGallery] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

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

  useEffect(() => {
    async function hydrateImages() {
      const hydrated = await Promise.all(
        artistGallery.map(async (img) => {
          if (!img.localRefId) return img;
          try {
            const blob = await loadBlob(img.localRefId);
            if (!blob) throw new Error('No blob found');
            const file = new File([blob], img.name || 'image.jpg', {
              type: blob.type || 'image/jpeg',
            });
            const url = img.url || URL.createObjectURL(blob);
            return { ...img, file, url };
          } catch (err) {
            return {
              ...img,
              url: img.url,
              metadata: {
                ...img.metadata,
                error: 'Failed to hydrate image file',
              },
            };
          }
        })
      );
      setLocalGallery(hydrated);
    }

    hydrateImages();
  }, [artistGallery]);

  const images = localGallery;

  const toggleSample = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, sampleEligible: !img.sampleEligible } : img
      )
    );
  };

  const toggleGallery = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img
      )
    );
  };

  const toggleScrape = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );
  };

  const removeImage = (id) => {
    setArtistGallery((prev) => prev.filter((img) => img.id !== id));
  };

  const updateTagField = (id, key, values) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              metadata: {
                ...img.metadata,
                [key]: values,
              },
            }
          : img
      )
    );
  };

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
          (blob) =>
            resolve(new File([blob], file.name, { type: 'image/jpeg' })),
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
      const uploadable = images.filter(
        (img) => (img.sampleEligible || img.galleryEligible) && img.file
      );

      if (uploadable.length === 0) {
        logToScreen('[GenerateTags] No images selected. Nothing to tag.');
        return;
      }

      logToScreen(`[GenerateTags] Uploading ${uploadable.length} images`);

      const formData = new FormData();
      for (const img of uploadable) {
        const compressed = await compressImage(img.file, 384, 0.7);
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
        },
      }));

      setArtistGallery((prev) =>
        prev.map((img) => tagged.find((t) => t.id === img.id) || img)
      );
    } catch (err) {
      logToScreen(`[GenerateTags] Batch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ padding: '0.75rem 1.25rem' }}
      >
        {loading ? 'Generating Tags...' : 'Generate MetaTags'}
      </button>

      <div style={{ marginTop: '1rem', fontFamily: 'monospace' }}>
        {logs.map((log, i) => (
          <div key={i}>📝 {log}</div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'center',
          alignItems: 'flex-end',
          marginTop: '2rem',
        }}
      >
        {images.map((img) => (
          <div key={img.id} style={{ width: '280px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{ width: '100%', borderRadius: '0.5rem' }}
            />
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
              {img.name}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => toggleScrape(img.id)}
                style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
              >
                {img.scrapeEligible ? 'Accepted' : 'Excluded'}
              </button>
              <button
                onClick={() => toggleGallery(img.id)}
                style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
              >
                Gallery
              </button>
              <button
                onClick={() => toggleSample(img.id)}
                style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
              >
                Sample
              </button>
              <button
                onClick={() => removeImage(img.id)}
                style={imageButton('#fee2e2', '#991b1b')}
              >
                Remove
              </button>
            </div>

            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
              <strong>Tags (editable)</strong>
            </div>

            <EditableTagList
              tags={img.metadata?.imageTags || []}
              label={'image'}
              onChange={(values) => updateTagField(img.id, 'imageTags', values)}
            />

            {img.metadata?.error && (
              <div
                style={{
                  color: 'red',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                }}
              >
                <strong>Error:</strong> {img.metadata.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
