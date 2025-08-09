// File: src/GenerateTags.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import GalleryGrid from './GalleryGrid';
import { toggleSampleWithLimit } from './utils/sampleUtils';
import LoadingOverlay from './utils/LoadingOverlay';
import ControlBar from './utils/ControlBar';
import { useDevMode } from './context/DevModeContext';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';

const API_BASE = 'https://api.yourcuration.app';

export default function GenerateTags({ setView }) {
  const { selectedFont } = useFontSettings();
  const { artistGallery, setArtistGallery } = useCuration();
  const { devMode } = useDevMode();

  const [localGallery, setLocalGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sampleWarningId, setSampleWarningId] = useState(null);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [logs, setLogs] = useState([]);
  const [overlayKey, setOverlayKey] = useState(0);

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  async function pingStatus(log) {
    try {
      const r = await fetch(`${API_BASE}/status`, { headers: { Accept: 'application/json' } });
      const j = await r.json();
      log(`🩺 /status ok: tagbank=${j?.caches?.tagbank?.shape} verbs=${j?.caches?.verbs?.shape}`);
    } catch (e) {
      log(`🩺 /status failed: ${e.message}`);
    }
  }

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
    toggleSampleWithLimit(id, artistGallery, setArtistGallery, setSampleWarningId);
  };

  const toggleGallery = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img))
    );
  };

  const toggleScrape = (id) => {
    setArtistGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img))
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
          (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
          'image/jpeg',
          quality
        );
      };
      reader.readAsDataURL(file);
    });
  }

  const handleGenerate = async () => {
    setOverlayKey((prev) => prev + 1);
    setLoading(true);
    setCancelRequested(false);
    try {
      await pingStatus(logToScreen);

      const uploadable = localGallery.filter(
        (img) => (img.sampleEligible || img.galleryEligible) && img.file
      );
      if (uploadable.length === 0) return;

      const formData = new FormData();
      for (const img of uploadable) {
        if (cancelRequested) throw new Error('User cancelled');
        const compressed = await compressImage(img.file, 384, 0.7);
        formData.append('files', compressed, img.name || 'image.jpg');
      }

      logToScreen(`🚀 POST ${API_BASE}/batch-tag with ${uploadable.length} files`);
      const res = await fetch(`${API_BASE}/batch-tag`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ` | ${body}` : ''}`);
      }

      const result = await res.json();

      const tagged = result.results.map((r, i) => {
        const img = uploadable[i];
        return {
          ...img,
          metadata: {
            ...img.metadata,
            ...r.metadata,
            metaTagGenerated: true,
          },
        };
      });

      setArtistGallery((prev) => {
        const updated = [...prev];
        let k = 0;
        for (let i = 0; i < updated.length && k < tagged.length; i++) {
          if ((updated[i].sampleEligible || updated[i].galleryEligible) && updated[i].file) {
            updated[i] = tagged[k++];
          }
        }
        return updated;
      });

      logToScreen(`✅ Tagged ${tagged.length} images.`);
    } catch (err) {
      console.error(`[GenerateTags] Batch error: ${err.message}`);
      logToScreen(`❌ Tagging failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const imageCount = localGallery.filter(
    (img) => (img.sampleEligible || img.galleryEligible) && img.file
  ).length;

  return (
    <div style={{ padding: '1rem 1rem 2rem', position: 'relative' }}>
      <ControlBar setView={setView} devMode={devMode} />

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
          {loading ? 'Processing Auto MetaTags...' : 'Generate MetaTags'}
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <GalleryGrid
          images={localGallery}
          onToggleSample={toggleSample}
          onToggleGallery={toggleGallery}
          onToggleScrape={toggleScrape}
          onRemove={removeImage}
          onUpdateTag={updateTagField}
          sampleWarningId={sampleWarningId}
          showTags
          devMode={devMode}
        />
      </div>

      {devMode && logs.length > 0 && (
        <div style={{ fontFamily: 'monospace', color: '#555', marginTop: '2rem' }}>
          {logs.map((log, i) => (
            <div key={i}>📦 {log}</div>
          ))}
        </div>
      )}

      {loading && (
        <LoadingOverlay
          key={overlayKey}
          onCancel={() => setCancelRequested(true)}
          imageCount={imageCount}
          mode="tag"
        />
      )}
    </div>
  );
}
