export default function buildOfflineBundle({
  heroImage,
  borderSkin,
  centerBackground,
  images,
  layoutChoice = 'grid',
  clientSessions = [],
}) {
  const bundle = {
    timestamp: new Date().toISOString(),
    heroImage,
    borderSkin,
    centerBackground,
    layoutChoice,
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