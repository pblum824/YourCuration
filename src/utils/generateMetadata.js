const allTags = {
  mood: ['calm', 'energetic', 'nostalgic', 'lonely', 'romantic', 'eerie'],
  subject: ['figure', 'animal', 'landscape', 'architecture', 'still-life', 'abstract'],
  lighting: ['backlit', 'high-contrast', 'soft-light', 'silhouette', 'overexposed'],
  color: ['monochrome', 'cool-toned', 'warm-toned', 'pastel', 'high-saturation'],
  composition: ['symmetry', 'rule-of-thirds', 'leading-lines', 'negative-space', 'centered-subject'],
  texture: ['soft-focus', 'grainy', 'sharp', 'layered', 'minimal'],
};

export default function generateMetadata(imageId) {
  const tags = [];

  Object.values(allTags).forEach(tagSet => {
    const randomTag = tagSet[Math.floor(Math.random() * tagSet.length)];
    tags.push(randomTag);
  });

  return {
    id: imageId,
    metadata: {
      tags,
    },
  };
}