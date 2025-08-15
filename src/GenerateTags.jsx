// File: src/GenerateTags.jsx
import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import GalleryGrid from './GalleryGrid';
import { toggleSampleWithLimit } from './utils/sampleUtils';
import LoadingOverlay from './utils/LoadingOverlay';
import ControlBar from './utils/ControlBar';
import { useDevMode } from './context/DevModeContext';
import { useFontSettings } from './FontSettingsContext';

export default function GenerateTags({ setView }) {
  const { selectedFont } = useFontSettings(); // retained for other consumers
  const { artistGallery, setArtistGallery } = useCuration();
  const { devMode } = useDevMode();

  const [localGallery, setLocalGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sampleWarningId, setSampleWarningId] = useState(null);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [logs, setLogs] = useState([]);
  const [overlayKey, setOverlayKey] = useState(0);

  const logToScreen = (msg) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Hydrate File objects from IndexedDB blobs for any items with localRefId
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
          } catch {
            return {
              ...img,
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

  const toggleSample = (id) =>
    toggleSampleWithLimit(id, artistGallery, setArtistGallery, setSampleWarningId);

  const toggleGallery = (id) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img
      )
    );

  const toggleScrape = (id) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );

  const removeImage = (id) =>
    setArtistGallery((prev) => prev.filter((img) => img.id !== id));

  const updateTagField = (id, key, values) =>
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, metadata: { ...img.metadata, [key]: values } }
          : img
      )
    );

  // client-side compression to keep payload small
  async function compressImage(file, maxDim = 384, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      img.onload = () => {
        const scale = maxDim / Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
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
      const uploadable = localGallery.filter(
        (img) => (img.sampleEligible || img.galleryEligible) && img.file
      );
      if (uploadable.length === 0) {
        logToScreen('No eligible images to tag.');
        return;
      }

      // quick status ping (dev-only feedback)
      try {
        const s = await fetch('https://api.yourcuration.app/status', { method: 'GET' });
        const sj = await s.json().catch(() => ({}));
        logToScreen(
          `/status ok: tagbank=${String(sj?.has_tagbank_vecs)} verbs=${String(
            sj?.has_verb_vecs
          )} taxonomy=${String(sj?.has_taxonomy_vecs)}`
        );
      } catch {
        logToScreen('/status failed (non-blocking)');
      }

      const t0 = performance.now();
      const formData = new FormData();

      for (const img of uploadable) {
        if (cancelRequested) throw new Error('User cancelled');
        const compressed = await compressImage(img.file, 384, 0.7);
        formData.append('files', compressed, compressed.name || img.name || 'image.jpg');
      }

      logToScreen(
        `POST https://api.yourcuration.app/batch-tag with ${uploadable.length} files`
      );

      const res = await fetch('https://api.yourcuration.app/batch-tag', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Backend returned ${res.status}`);

      const result = await res.json();
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

      const rows = Array.isArray(result?.results) ? result.results : [];
      if (rows.length !== uploadable.length) {
        logToScreen(
          `⚠️ result count mismatch (got ${rows.length}, expected ${uploadable.length})`
        );
      }

      const tagged = rows.map((r, i) => {
        const img = uploadable[i];
        const meta = r?.metadata || {};

        // Map backend taxonomy → compact FE term: genre
        const genreTags = Array.isArray(meta.taxonomyTags) ? meta.taxonomyTags : [];
        const imageTags = Array.isArray(meta.imageTags) ? meta.imageTags : [];
        const textTags  = Array.isArray(meta.textTags) ? meta.textTags : [];

        return {
          ...img,
          metadata: {
            ...img.metadata,
            ...meta,          // keep raw fields for completeness
            genreTags,        // compact alias used by FE/UI
            imageTags,
            textTags,
            metaTagGenerated: true,
          },
          tags: {
            ...(img.tags || {}),
            image: imageTags,
            text: textTags,
            genre: genreTags, // duplicate path for components that read tags.*
          },
        };
      });

      setArtistGallery((prev) => {
        const updated = [...prev];
        const used = new Array(tagged.length).fill(false);
        for (let i = 0; i < updated.length; i++) {
          for (let j = 0; j < tagged.length; j++) {
            if (!used[j] && updated[i].id === tagged[j].id) {
              updated[i] = tagged[j];
              used[j] = true;
              break;
            }
          }
        }
        return updated;
      });

      const sampleImageTags = tagged[0]?.metadata?.imageTags || [];
      const sampleTextTags  = tagged[0]?.metadata?.textTags || [];
      const sampleGenreTags = tagged[0]?.metadata?.genreTags || [];
      logToScreen(`✅ Tagged ${tagged.length} images in ${elapsed}s`);
      logToScreen(`image[0]: ${JSON.stringify(sampleImageTags)}`);
      logToScreen(`text[0]: ${JSON.stringify(sampleTextTags)}`);
      logToScreen(`genre[0]: ${JSON.stringify(sampleGenreTags)}`);
    } catch (err) {
      console.error('[GenerateTags] error:', err);
      logToScreen(`❌ Tagging failed: ${err?.message || err}`);
      try {
        const r = err?.response ? await err.response.text() : '';
        if (r) logToScreen(`❌ Backend said: ${r.slice(0, 500)}...`);
      } catch {}
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
