// file: src/GenerateTags.jsx — invisible chunking (200 default) with DevMode timing
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

  // Shallow clone; no hydration here
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

  // Convert blob:/data: → File so backend can accept via /batch-tag
  async function partitionUploadables(items, log) {
    const withFiles = [];
    const withUrls = [];
    let converted = 0, skipped = 0;
    for (const img of items) {
      if (img.file) { withFiles.push(img); continue; }
      const u = img.url || '';
      if (u.startsWith('http://') || u.startsWith('https://')) {
        withUrls.push({ id: img.id, url: u, name: img.name });
      } else if (u.startsWith('blob:') || u.startsWith('data:')) {
        try {
          const resp = await fetch(u);
          const blob = await resp.blob();
          const file = new File([blob], img.name || 'image.jpg', { type: blob.type || 'image/jpeg' });
          withFiles.push({ ...img, file });
          converted++;
        } catch (e) {
          skipped++; log && log(`blob/data convert failed for ${img.name || img.id}: ${e?.message || e}`);
        }
      } else {
        skipped++; log && log(`skip unsupported URL scheme for ${img.name || img.id}: ${u}`);
      }
    }
    log && log(`partitioned: files=${withFiles.length}, urls=${withUrls.length}, converted=${converted}, skipped=${skipped}`);
    return { withFiles, withUrls };
  }

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
        canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', quality);
      };
      reader.readAsDataURL(file);
    });
  }

  async function sendFiles(withFiles, vc) {
    if (!withFiles || withFiles.length === 0) return [];
    const formData = new FormData();
    for (const img of withFiles) {
      if (cancelRequested) throw new Error('User cancelled');
      const compressed = await compressImage(img.file, 384, 0.7);
      formData.append('files', compressed, compressed.name || img.name || 'image.jpg');
    }
    formData.append('visual_config', JSON.stringify(vc));

    const res = await fetch('https://api.yourcuration.app/batch-tag', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`/batch-tag ${res.status}`);
    const j = await res.json();
    const rows = Array.isArray(j?.results) ? j.results : [];
    return rows.map((r, i) => ({ id: withFiles[i].id, name: withFiles[i].name, meta: r?.metadata || {} }));
  }

  async function sendUrls(withUrls, vc) {
    if (!withUrls || withUrls.length === 0) return [];
    const payload = { visual_config: vc, items: withUrls };
    const res = await fetch('https://api.yourcuration.app/batch-tag-urls', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`/batch-tag-urls ${res.status}`);
    const j = await res.json();
    const rows = Array.isArray(j?.results) ? j.results : [];
    return rows.map((r) => ({ id: r.id, name: r.name, meta: r?.metadata || {} }));
  }

  async function processChunk(chunkItems, vc, idx, totalChunks) {
    const label = `Chunk ${idx+1}/${totalChunks}`;
    const t0 = performance.now();
    const { withFiles, withUrls } = await partitionUploadables(chunkItems, devMode && logToScreen);
    const byFile = await sendFiles(withFiles, vc);
    const byUrl  = await sendUrls(withUrls, vc);
    const combined = [...byFile, ...byUrl];

    // merge back
    const mapById = new Map(combined.map((x) => [x.id, x]));
    setArtistGallery((prev) => prev.map((img) => {
      const found = mapById.get(img.id);
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
    const perImg = dt / Math.max(1, chunkItems.length);
    if (devMode) logToScreen(`${label} — sent ${chunkItems.length} in ${dt.toFixed(1)}s (${perImg.toFixed(3)} s/img)`);
    return { dt, perImg, count: chunkItems.length };
  }

  const handleGenerate = async () => {
    setOverlayKey((prev) => prev + 1);
    setLoading(true);
    setCancelRequested(false);

    try {
      const all = localGallery; // send entire gallery (reliable retag)
      if (all.length === 0) { logToScreen('No images to tag.'); return; }

      // status ping (optional)
      try {
        const s = await fetch('https://api.yourcuration.app/status', { method: 'GET' });
        const sj = await s.json().catch(() => ({}));
        if (devMode) logToScreen(`/status ok: tagbank=${String(sj?.has_tagbank_vecs)} verbs=${String(sj?.has_verb_vecs)} imgModel=${String(sj?.img_model_loaded)}`);
      } catch { if (devMode) logToScreen('/status failed (non-blocking)'); }

      const vc = buildBackendVisualConfig(visualConfig);
      const SAFETY_SECS = 80;             // stay under Cloudflare 100s
      let chunkSize = 200;                // reliable default
      const minChunk = 100, maxChunk = 280;

      let remaining = [...all];
      const total = remaining.length;
      let chunkIdx = 0;
      const tStart = performance.now();

      while (remaining.length && !cancelRequested) {
        const totalChunks = Math.ceil(remaining.length / chunkSize);
        const batch = remaining.slice(0, chunkSize);
        remaining = remaining.slice(chunkSize);

        const { dt, perImg, count } = await processChunk(batch, vc, chunkIdx, totalChunks + chunkIdx);

        // adapt next chunk size with guardrails
        const est = SAFETY_SECS / Math.max(perImg, 0.001);
        const nextSize = Math.max(minChunk, Math.min(maxChunk, Math.floor(est)));
        // Gentle adjustments to avoid oscillation
        if (dt > 75 && chunkSize > minChunk) chunkSize = Math.max(minChunk, Math.floor(chunkSize * 0.85));
        else if (dt < 50 && chunkSize < maxChunk) chunkSize = Math.min(maxChunk, Math.floor((chunkSize + nextSize) / 2));
        else chunkSize = nextSize;

        chunkIdx += 1;
      }

      const totalSec = ((performance.now() - tStart) / 1000).toFixed(1);
      logToScreen(`✅ All chunks done — ${total} images in ${totalSec}s`);
    } catch (err) {
      console.error('[GenerateTags] error:', err);
      logToScreen(`❌ Tagging failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const imageCount = localGallery.length; // all images

  const generateButton = (
    <button
      onClick={handleGenerate}
      disabled={loading}
      style={{
        padding: '1rem 2rem', fontSize: '1.25rem', borderRadius: '0.5rem',
        backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer',
        opacity: loading ? 0.6 : 1, transition: 'width 200ms ease',
      }}
    >
      {loading ? 'Processing Auto MetaTags...' : 'Generate MetaTags'}
    </button>
  );

  return (
    <div style={{ padding: '1rem 1rem 2rem', position: 'relative' }}>
      <ControlBar setView={setView} devMode={devMode} />

      {devMode ? (
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
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>{generateButton}</div>
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
