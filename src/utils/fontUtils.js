export function getFontStyle(mode, fontSettings) {
  if (mode === 'client') {
    return { fontFamily: 'Parisienne, cursive' };
  }
  return { fontFamily: fontSettings.selectedFont || 'system-ui' };
}