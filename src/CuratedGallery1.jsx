import React from 'react';
import { useCuration } from './YourCurationContext';

export default function CuratedGallery1() {
  const { artistGallery, ratings } = useCuration();

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '1.25rem', color: 'green' }}>
      ✅ CG1 renders context: {artistGallery.length} images, {Object.keys(ratings).length} ratings
    </div>
  );
}