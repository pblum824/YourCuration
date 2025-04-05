export default function loadReadyBundle() {
  const stored = localStorage.getItem('yourcuration_readyBundle');
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed;
  } catch (err) {
    console.error('Failed to parse ready bundle:', err);
    return null;
  }
}