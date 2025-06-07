import React from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';

export default function CuratedGallery1() {
  const { artistGallery, ratings } = useCuration();

  let result = {};
  try {
    result = curateGallery1({ artistGallery, ratings });
  } catch (err) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        ❌ curateGallery1 failed: {err.message}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '1.25rem', color: 'green' }}>
      ✅ CG1 scored: strong={result.strong?.length || 0}, medium={result.medium?.length || 0}, weak={result.weak?.length || 0}
    </div>
  );
}