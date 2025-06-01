// File: src/utils/scoreImage.js

/**
 * Extracts all tags from an image's metadata
 */
export function extractAllTags(metadata = {}) {
  return [
    ...(metadata.imageTags || []),
    ...(metadata.textTags || []),
    ...(metadata.toneTags || []),
    ...(metadata.moodTags || []),
    ...(metadata.paletteTags || [])
  ];
}

/**
 * Aggregates tags from multiple samples by sentiment
 */
export function aggregateSampleTags(samples, ratings) {
  const love = new Set();
  const like = new Set();
  const less = new Set();

  samples.forEach(sample => {
    const rating = ratings[sample.id];
    const tags = extractAllTags(sample.metadata);
    tags.forEach(tag => {
      if (rating === 'love') love.add(tag);
      else if (rating === 'like') like.add(tag);
      else if (rating === 'less') less.add(tag);
    });
  });

  return { love, like, less };
}

/**
 * Scores a candidate image based on tag overlap with rated samples
 */
export function scoreImage(candidate, tagPools, weights = { love: 3, like: 1, less: -5 }) {
  let score = 0;
  const candidateTags = new Set(extractAllTags(candidate.metadata));

  candidateTags.forEach(tag => {
    if (tagPools.love.has(tag)) score += weights.love;
    if (tagPools.like.has(tag)) score += weights.like;
    if (tagPools.less.has(tag)) score += weights.less;
  });

  return score;
}