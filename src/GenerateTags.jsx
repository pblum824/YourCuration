// File: src/GenerateTags.jsx — full patched (DevDialsStrip + Reset + percent→backend)
import React, { useEffect, useMemo, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { loadBlob } from './utils/dbCache';
import GalleryGrid from './GalleryGrid';
import { toggleSampleWithLimit } from './utils/sampleUtils';
import LoadingOverlay from './utils/LoadingOverlay';
import ControlBar from './utils/ControlBar';
import { useDevMode } from './context/DevModeContext';
import { useFontSettings } from './FontSettingsContext';
import DevDialsStrip from './DevDialsStrip';

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

  // Percent-based UI defaults; backend needs fractions for *_MAX/MIN ratios
  const defaultVisualConfig = useMemo(() => ({
    NEUTRAL_COLORED_MAX: 3,   // % → 0.03
    NEUTRAL_RATIO_MIN: 95,    // % → 0.95
    BW_EXTREME_MIN: 90,       // % → 0.90
    BW_MID_MAX: 6,            // % → 0.06
    BW_ENTROPY_MAX: 3.5,      // bits
    DISTINCT_DE: 22,
    DISTINCT_DHUE: 15,        // °
    SELECTIVE_MAX: 40,        // % → 0.40
    DOMINANCE_NARROW: 75,     // % → 0.75
    SEPIA_HUE_MIN: 15,
    SEPIA_HUE_MAX: 50,
  }), []);

  const [visualConfig, setVisualConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('yourcuration.visualConfig.v1');
      if (saved) return { ...defaultVisualConfig, ...JSON.parse(saved) };
    } catch {}
    return defaultVisualConfig;
  });

  useEffect(() => {
    try {
      localStorage.setItem('yourcuration.visualConfig.v1', JSON.stringify(visualConfig));
    } catch {}
  }, [visualConfig]);

  const resetToDefaults = () => {
    try { localStorage.removeItem('yourcuration.visualConfig.v1'); } catch {}
    setVisualConfig(defaultVisualConfig);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Reset visual dials to defaults`]);
  };

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

  // Transform UI (%/°) → backend config (fractions where expected)
  function buildBackendVisualConfig(ui) {
    const toFrac = (pct) => Math.max(0, Math.min(1, Number(pct) / 100));
    return {
      version: 1,
      NEUTRAL_COLORED_MAX: toFrac(ui.NEUTRAL_COLORED_MAX),
      NEUTRAL_RATIO_MIN:   toFrac(ui.NEUTRAL_RATIO_MIN),
      BW_EXTREME_MIN:      toFrac(ui.BW_EXTREME_MIN),
      BW_MID_MAX:          toFrac(ui.BW_MID_MAX),
      BW_ENTROPY_MAX:      Number(ui.BW_ENTROPY_MAX),
      DISTINCT_DE:         Number(ui.DISTINCT_DE),
      DISTINCT_DHUE:       Number(ui.DISTINCT_DHUE),
      SELECTIVE_MAX:       toFrac(ui.SELECTIVE_MAX),
      DOMINANCE_NARROW:    toFrac(ui.DOMINANCE_NARROW),
      SEPIA_HUE_MIN:       Number(ui.SEPIA_HUE_MIN),
      SEPIA_HUE_MAX:       Number(ui.SEPIA_HUE_MAX),
    };
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

      // Attach visual_config (JSON). If backend ignores, defaults apply.
      const vc = buildBackendVisualConfig(visualConfig);
      formData.append('visual_config', JSON.stringify(vc));
      if (devMode) logToScreen(`visual_config: ${JSON.stringify(vc)}`);

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

        const genreTags = Array.isArray(meta.taxonomyTags) ? meta.taxonomyTags : [];
        const imageTags = Array.isArray(meta.imageTags) ? meta.imageTags : [];
        const textTags  = Array.isArray(meta.textTags) ? meta.textTags : [];

        return {
          ...img,
          metadata: {
            ...img.metadata,
            ...meta,
            genreTags,
            imageTags,
            textTags,
            metaTagGenerated: true,
          },
          tags: {
            ...(img.tags || {}),
            image: imageTags,
            text: textTags,
            genre: genreTags,
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

      {/* Dev dials flanking the central button */}
      <DevDialsStrip
        devMode={devMode}
        values={visualConfig}
        onChange={(k, v) => setVisualConfig((prev) => ({ ...prev, [k]: v }))}
        onReset={resetToDefaults}
        center={(
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
              transition: 'width 200ms ease',
            }}
          >
            {loading ? 'Processing Auto MetaTags...' : 'Generate MetaTags'}
          </button>
        )}
      />

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
