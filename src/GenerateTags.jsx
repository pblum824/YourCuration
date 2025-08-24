// file: src/GenerateTags.jsx — chunked processing (invisible to user), DevMode logs show chunk timings
import React, { useEffect, useMemo, useState } from 'react';
import { useCuration } from './YourCurationContext';
import GalleryGrid from './GalleryGrid';
import { toggleSampleWithLimit } from './utils/sampleUtils';
import LoadingOverlay from './utils/LoadingOverlay';
import ControlBar from './utils/ControlBar';
import { useDevMode } from './context/DevModeContext';
import { useFontSettings } from './FontSettingsContext';
import DevDialsStrip from './DevDialsStrip';

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

  const defaultVisualConfig = useMemo(() => ({
    NEUTRAL_COLORED_MAX: 3,
    NEUTRAL_RATIO_MIN: 95,
    BW_EXTREME_MIN: 90,
    BW_MID_MAX: 6,
    BW_ENTROPY_MAX: 3.5,
    DISTINCT_DE: 22,
    DISTINCT_DHUE: 15,
    SELECTIVE_MAX: 40,
    DOMINANCE_NARROW: 75,
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
    try { localStorage.setItem('yourcuration.visualConfig.v1', JSON.stringify(visualConfig)); } catch {}
  }, [visualConfig]);

  const logToScreen = (msg) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    setLocalGallery(artistGallery.map((img) => ({ ...img })));
  }, [artistGallery]);

  const toggleSample = (id) => toggleSampleWithLimit(id, artistGallery, setArtistGallery, setSampleWarningId);
  const toggleGallery = (id) => setArtistGallery((prev) => prev.map((img) => img.id === id ? { ...img, galleryEligible: !img.galleryEligible } : img));
  const toggleScrape = (id) => setArtistGallery((prev) => prev.map((img) => img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img));
  const removeImage = (id) => setArtistGallery((prev) => prev.filter((img) => img.id !== id));
  const updateTagField = (id, key, values) => setArtistGallery((prev) => prev.map((img) => img.id === id ? { ...img, metadata: { ...img.metadata, [key]: values } } : img));

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

  async function sendFiles(uploadableWithFiles, vc) {
    if (uploadableWithFiles.length === 0) return [];
    const formData = new FormData();
    for (const img of uploadableWithFiles) {
      if (cancelRequested) throw new Error('User cancelled');
      formData.append('files', img.file, img.file.name || img.name || 'image.jpg');
    }
    formData.append('visual_config', JSON.stringify(vc));

    const res = await fetch('https://api.yourcuration.app/batch-tag', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Backend(files) ${res.status}`);
    const j = await res.json();
    const rows = Array.isArray(j?.results) ? j.results : [];
    return rows.map((r, i) => ({ id: uploadableWithFiles[i].id, name: uploadableWithFiles[i].name, meta: r?.metadata || {} }));
  }

  async function sendUrls(uploadableWithUrls, vc) {
    if (uploadableWithUrls.length === 0) return [];
    const payload = { visual_config: vc, items: uploadableWithUrls.map((img) => ({ id: img.id, url: img.url, name: img.name })) };
    try {
      const res = await fetch('https://api.yourcuration.app/batch-tag-urls', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) return [];
      const j = await res.json();
      const rows = Array.isArray(j?.results) ? j.results : [];
      return rows.map((r) => ({ id: r.id, name: r.name, meta: r?.metadata || {} }));
    } catch {
      return [];
    }
  }

  const handleGenerate = async () => {
    setOverlayKey((prev) => prev + 1);
    setLoading(true);
    setCancelRequested(false);

    try {
      const eligible = localGallery.filter((img) => (img.sampleEligible || img.galleryEligible));
      if (eligible.length === 0) { logToScreen('No eligible images to tag.'); return; }

      const vc = buildBackendVisualConfig(visualConfig);

      let remaining = [...eligible];
      let chunkSize = 200;
      let chunkIndex = 0;

      while (remaining.length > 0) {
        const batch = remaining.splice(0, chunkSize);
        chunkIndex++;
        const t0 = performance.now();

        const withFiles = batch.filter((img) => img.file);
        const withUrls  = batch.filter((img) => !img.file && !!img.url);

        const byFile = await sendFiles(withFiles, vc);
        const byUrl  = await sendUrls(withUrls, vc);

        const combined = [...byFile, ...byUrl];
        const combinedById = new Map(combined.map((x) => [x.id, x]));

        setArtistGallery((prev) => prev.map((img) => {
          const found = combinedById.get(img.id);
          if (!found) return img;
          const meta = found.meta || {};
          return {
            ...img,
            metadata: { ...img.metadata, ...meta, metaTagGenerated: true },
            tags: {
              ...(img.tags || {}),
              image: Array.isArray(meta.imageTags) ? meta.imageTags : [],
              text: Array.isArray(meta.textTags) ? meta.textTags : [],
              genre: Array.isArray(meta.taxonomyTags) ? meta.taxonomyTags : [],
            },
          };
        }));

        const dt = (performance.now() - t0) / 1000;
        if (devMode) logToScreen(`Chunk ${chunkIndex} — ${batch.length} images in ${dt.toFixed(1)}s (${(dt/batch.length).toFixed(3)}s/img)`);

        // adjust next chunk size safely
        const tImg = dt / batch.length;
        const budget = 80; // s, safe under CF cap
        chunkSize = Math.max(100, Math.min(250, Math.floor(budget / tImg)));
      }

      logToScreen(`✅ All chunks complete`);
    } catch (err) {
      console.error('[GenerateTags] error:', err);
      logToScreen(`❌ Tagging failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const imageCount = localGallery.filter((img) => (img.sampleEligible || img.galleryEligible)).length;

  const generateButton = (
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
  );

  return (
    <div style={{ padding: '1rem 1rem 2rem', position: 'relative' }}>
      <ControlBar setView={setView} devMode={devMode} />

      {devMode ? (
        <>
          <DevDialsStrip
            devMode
            values={visualConfig}
            onChange={(k, v) => setVisualConfig((prev) => ({ ...prev, [k]: v }))}
            onReset={() => {
              try { localStorage.removeItem('yourcuration.visualConfig.v1'); } catch {}
              setVisualConfig(defaultVisualConfig);
              logToScreen(`[${new Date().toLocaleTimeString()}] Reset visual dials to defaults`);
            }}
            center={generateButton}
          />
          {logs.length > 0 && (
            <div style={{ fontFamily: 'monospace', color: '#555', marginTop: '1rem' }}>
              {logs.map((log, i) => (<div key={i}>📦 {log}</div>))}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {generateButton}
        </div>
      )}

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
          {logs.map((log, i) => (<div key={i}>📦 {log}</div>))}
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
