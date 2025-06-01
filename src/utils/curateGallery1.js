// File: src/utils/curateGallery1.js
import { aggregateSampleTags, scoreImage } from './scoreImage';

/**
 * Returns grouped candidates: strong, medium, weak based on score tiers
 * based on SampleRater's feedback (ratings)
 */
export function curateGallery1({ artistGallery, ratings }) {
  const samples = artistGallery.filter((img) => ratings[img.id]);
  const candidates = artistGallery.filter(
    (img) => img.galleryEligible && !ratings[img.id]
  );

  const tagPools = aggregateSampleTags(samples, ratings);

  const scored = candidates.map((img) => ({
    ...img,
    matchScore: scoreImage(img, tagPools),
  }));

  const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);

  // Group by tier
  const strong = sorted.filter((img) => img.matchScore >= 6).slice(0, 8); // ✅ "This is probably it"
  const medium = sorted.filter((img) => img.matchScore >= 2 && img.matchScore < 6).slice(0, 8); // 🤔 "Could work"
  const weak = sorted.filter((img) => img.matchScore < 2).slice(0, 4); // 🧠 "What about this"

  return { strong, medium, weak };
}