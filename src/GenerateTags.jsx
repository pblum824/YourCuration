import React, { useState } from 'react';
import { useCuration } from './YourCurationContext';

export default function GenerateTags() {
  const curation = useCuration();
  const {
    artistSamples,
    setArtistSamples,
    artistGallery,
    setArtistGallery
  } = curation || {};

  const [target, setTarget] = useState('samples');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const images = target === 'samples' ? artistSamples : artistGallery;
  const setImages = target === 'samples' ? setArtistSamples : setArtistGallery;

  const logToScreen = (msg) => setLogs((prev) => [...prev, msg]);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ fontFamily: 'monospace', color: 'red', marginBottom: '1rem' }}>
        <div><strong>[Debug]</strong></div>
        <div>target: {target}</div>
        <div>artistSamples: {Array.isArray(artistSamples) ? artistSamples.length : 'undefined'}</div>
        <div>artistGallery: {Array.isArray(artistGallery) ? artistGallery.length : 'undefined'}</div>
        <div>images: {Array.isArray(images) ? images.length : 'not array'}</div>
        <div>setImages: {typeof setImages}</div>
        <div>useCuration: {curation ? '✅ ok' : '❌ undefined/null'}</div>
      </div>

      <button onClick={() => setTarget('samples')}>Use Samples</button>
      <button onClick={() => setTarget('gallery')}>Use Gallery</button>
    </div>
  );
}