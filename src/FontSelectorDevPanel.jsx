import React from 'react';
import { useFontSettings } from './FontSettingsContext';

export function FontSelectorDevPanel({ devMode }) {
  const { selectedFont, setSelectedFont } = useFontSettings();

  // ✅ Added Times New Roman
  const fontOptions = [
    'Times New Roman, serif',
    'system-ui',
    'Arial',
    'Georgia',
    'Courier New',
    'Verdana'
  ];

  if (!devMode) return null;

  return (
    <div style={{ padding: '1rem', border: '1px dashed gray' }}>
      <label htmlFor="font-select">Font Fallback: </label>
      <select
        id="font-select"
        value={selectedFont}
        onChange={(e) => setSelectedFont(e.target.value)}
      >
        {fontOptions.map((font) => (
          <option key={font} value={font}>{font}</option>
        ))}
      </select>
    </div>
  );
}