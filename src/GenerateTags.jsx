// File: src/GenerateTags.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import EditableTagList from './EditableTagList';
import ImageCard from './ImageCard';

export default function GenerateTags() {
  const { artistGallery, setArtistGallery } = useCuration();

  const [localGallery, setLocalGallery] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sampleWarningId, setSampleWarningId] = useState(null);

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

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

  const toggleSample = (id) => {
    const sampleCount = artistGallery.filter((img) => img.sampleEligible).length;
    const isTargetSample = artistGallery.find((img) => img.id === id)?.sampleEligible;

    if (isTargetSample || sampleCount < 15) {
      setArtistGallery((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, sampleEligible: !img.sampleEligible } : img
        )
      );
      setSampleWarningId(null);
    } else {
      setSampleWarningId(id);
    }
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
      const uploadable = localGallery.filter(
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: '#1e3a8a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Generating Tags...' : 'Generate MetaTags'}
        </button>
      </div>

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
        {localGallery.map((img) => (
          <div key={img.id}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#888' }}>
              🔍 rendering: {img.name}
            </div>
            <ImageCard
              image={img}
              onToggleSample={toggleSample}
              onToggleGallery={toggleGallery}
              onToggleScrape={toggleScrape}
              onRemove={removeImage}
              onUpdateTag={updateTagField}
              sampleWarningId={sampleWarningId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}