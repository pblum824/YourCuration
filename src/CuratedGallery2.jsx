import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { aggregateSampleTags, scoreImage, extractAllTags } from './utils/scoreImage';

export default function CuratedGallery2() {
  const { artistGallery = [], ratings = {} } = useCuration();
  const [scored, setScored] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // 1. Get SampleRater picks
      const samples = artistGallery.filter((img) => ratings[img.id]);

      // 2. Get unrated galleryEligible images
      const candidates = artistGallery.filter(
        (img) => img.galleryEligible && !ratings[img.id]
      );

      // 3. Build tagPools
      const tagPools = aggregateSampleTags(samples, ratings);

      // 4. Filter out any candidate with a "less" tag
      const safe = candidates.filter((img) => {
        const tags = extractAllTags(img.metadata || {});
        return tags.every((tag) => !tagPools.less.has(tag));
      });

      // 5. Score the safe candidates
      const scored = safe.map((img) => ({
        ...img,
        matchScore: scoreImage(img, tagPools)
      }));

      // 6. Sort descending
      const sorted = scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setScored(sorted);
    } catch (err) {
      setError(err.message || 'CG2 scoring failed.');
    }
  }, [artistGallery, ratings]);

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>❌ Error: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#1e3a8a' }}>🔬 CG2 Preview: Scored Candidates</h2>
      {scored.length === 0 && <p>No matches found for CG2.</p>}
      {scored.map((img) => (
        <div key={img.id} style={{ marginBottom: '1rem' }}>
          <strong>{img.name}</strong><br />
          score: {img.matchScore}
        </div>
      ))}
    </div>
  );
}