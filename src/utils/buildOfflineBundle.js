// File: src/utils/buildOfflineBundle.js

export default function buildOfflineBundle({
  heroImage,
  borderSkin,
  centerBackground,
  images,
  layoutChoice = 'grid',
  clientSessions = [],
  selectedFont = 'Times New Roman, serif' // ✅ added default font fallback
}) {
  const bundle = {
    timestamp: new Date().toISOString(),
    heroImage,
    borderSkin,
    centerBackground,
    layoutChoice,
    selectedFont, // ✅ included in output
    images: images
      .filter(img => img.scrapeEligible)
      .map(({ id, name, url, scrapeEligible, metadata }) => ({
        id, name, url, scrapeEligible, metadata
      })),
    clientSessions,
  };

  try {
    localStorage.setItem('yourcuration_readyBundle', JSON.stringify(bundle));
    return bundle;
  } catch (err) {
    console.error('Failed to save bundle:', err);
    return null;
  }
}