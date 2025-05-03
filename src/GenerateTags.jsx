import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';

export default function GenerateTags() {
  const { artistSamples, setArtistSamples } = useCuration();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tagged = await Promise.all(
        artistSamples.map(async (img) => {
          try {
            logToScreen(`[GenerateTags] Uploading ${img.name}`);
            const formData = new FormData();
            formData.append('image', img.file, img.name);

            const res = await fetch('http://44.223.11.189:3000/batch-tag', {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) throw new Error(`Failed (${res.status})`);

            const result = await res.json();
            const imageTags = result.metadata?.imageTags || [];
            const textTags = result.metadata?.textTags || [];

            return { ...img, metadata: { imageTags, textTags } };
          } catch (err) {
            logToScreen(`[GenerateTags] Failed for ${img.name}: ${err.message}`);
            return { ...img, metadata: { imageTags: [], textTags: [], error: err.message } };
          }
        })
      );

      setArtistSamples(tagged);
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
}