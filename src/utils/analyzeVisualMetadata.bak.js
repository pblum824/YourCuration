// analyzeVisualMetadata.js

import { logToScreen } from '../GenerateTags';

export async function analyzeImageFromURL(url) {
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return analyzeImage(ctx, canvas.width, canvas.height, imageData);
  } catch (e) {
    const msg = `[AVM] Failed to analyze ${url}: ${e.message}`;
    console.warn(msg);
    alert(msg);
    return {
      tags: [],
      dimensions: {
        colorPalette: [],
        visualTone: [],
        mood: [],
        subject: [],
        message: []
      },
      dominantHue: null
    };
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      const msg = `[IMG ERROR] ${src}`;
      console.warn(msg, e);
      alert(msg);
      reject(e);
    };
    img.src = src;
  });
}

function analyzeImage(ctx, width, height, imageDataFull) {
  const data = imageDataFull.data;
  const totalPixels = width * height;
  const brightnessValues = [];
  const colorCounts = {};

  let brightnessSum = 0;
  let blackPixelCount = 0;
  let whitePixelCount = 0;
  let saturatedPixelCount = 0;
  let bwScore = 0;

  const hues = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    brightnessSum += brightness;
    brightnessValues.push(brightness);

    if (brightness < 40) blackPixelCount++;
    if (brightness > 220) whitePixelCount++;

    const hue = rgbToHue(r, g, b);
    hues.push(hue);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    if (saturation > 0.1) saturatedPixelCount++;

    if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) bwScore++;

    const key = `${Math.round(r / 32) * 32}-${Math.round(g / 32) * 32}-${Math.round(b / 32) * 32}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;
  }

  const avgBrightness = brightnessSum / totalPixels;
  const stdDev = Math.sqrt(
    brightnessValues.reduce((sum, val) => sum + Math.pow(val - avgBrightness, 2), 0) / totalPixels
  );

  const blackRatio = blackPixelCount / totalPixels;
  const whiteRatio = whitePixelCount / totalPixels;
  const colorRatio = saturatedPixelCount / totalPixels;
  const bwRatio = bwScore / totalPixels;

  const tags = [];
  const dimensions = {
    colorPalette: [],
    visualTone: [],
    mood: [],
    subject: [],
    message: []
  };

  let dominantHue = null;

  if (blackRatio > 0.7 && colorRatio < 0.05) {
    tags.push('low-key');
    dimensions.colorPalette.push('low-key');
  } else if (whiteRatio > 0.7 && colorRatio < 0.05) {
    tags.push('high-key');
    dimensions.colorPalette.push('high-key');
  }

  if (blackRatio > 0.7) {
    tags.push('black-dominant');
    dimensions.colorPalette.push('black-dominant');
  }
  if (whiteRatio > 0.7) {
    tags.push('white-dominant');
    dimensions.colorPalette.push('white-dominant');
  }

  if (colorRatio < 0.1) {
    tags.push('monochrome');
    dimensions.colorPalette.push('monochrome');
  }

  if (bwRatio > 0.7) {
    tags.push('black and white');
    dimensions.colorPalette.push('black and white');
  }

  if (blackRatio < 0.7 && whiteRatio < 0.7 && colorRatio >= 0.1) {
    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([rgb]) => {
        const [r, g, b] = rgb.split('-').map(Number);
        const hue = rgbToHue(r, g, b);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        return { r, g, b, hue, saturation };
      });

    topColors.forEach(({ hue, saturation }) => {
      if (saturation < 0.1) return;
      if (hue >= 0 && hue < 50) {
        tags.push('warm tones');
        dimensions.colorPalette.push('warm tones');
      } else if (hue >= 180 && hue < 260) {
        tags.push('cool tones');
        dimensions.colorPalette.push('cool tones');
      } else {
        tags.push('neutral');
        dimensions.colorPalette.push('neutral');
      }
    });

    dominantHue = Math.round(hues[0]);
  }

  const toneResults = detectTone(brightnessValues, avgBrightness, stdDev, width, data);
  dimensions.visualTone = toneResults.tone;
  tags.push(...toneResults.tags);

  const moodResults = detectMood(avgBrightness, stdDev, colorRatio, dominantHue);
  dimensions.mood = moodResults;
  tags.push(...moodResults);

  return {
    tags: Array.from(new Set(tags)),
    dimensions,
    dominantHue
  };
}

function detectTone(brightnessValues, avgBrightness, stdDev, width, imageData) {
  const tags = [];
  const tone = [];

  if (stdDev > 50) {
    tone.push('high contrast');
    tags.push('high contrast');
  }

  if (stdDev < 20) {
    tone.push('soft-focus');
    tags.push('soft-focus');
  }

  if (avgBrightness < 100 && stdDev > 35) {
    tone.push('grainy');
    tags.push('grainy');
  }

  const edgeBrightness =
    brightnessValues.slice(0, width).concat(brightnessValues.slice(-width))
      .reduce((sum, b) => sum + b, 0) / (2 * width);

  const centerBrightness = brightnessValues[Math.floor(brightnessValues.length / 2)];

  if (edgeBrightness > centerBrightness + 30) {
    tone.push('backlit');
    tags.push('backlit');
  }

  return { tone: Array.from(new Set(tone)), tags: Array.from(new Set(tags)) };
}

function detectMood(avgBrightness, stdDev, colorRatio, dominantHue) {
  const mood = [];

  if (avgBrightness > 180 && stdDev < 30 && colorRatio < 0.2) {
    mood.push('calm');
  }
  if (avgBrightness < 70 && stdDev < 20 && colorRatio < 0.1) {
    mood.push('lonely');
  }
  if (stdDev > 50 && avgBrightness < 120 && colorRatio < 0.15) {
    mood.push('eerie');
  }
  if (colorRatio > 0.2 && avgBrightness > 100 && stdDev < 35) {
    mood.push('romantic');
  }
  if (stdDev > 45 && colorRatio > 0.25) {
    mood.push('energetic');
  }
  if (dominantHue !== null && dominantHue >= 30 && dominantHue <= 70) {
    mood.push('nostalgic');
  }

  return Array.from(new Set(mood));
}

function rgbToHue(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max === min) h = 0;
  else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
  else if (max === g) h = (60 * ((b - r) / (max - min)) + 120) % 360;
  else if (max === b) h = (60 * ((r - g) / (max - min)) + 240) % 360;
  return h;
}

export {
  analyzeImageFromURL as analyzeVisualMetadataFromImage,
  analyzeImage,
  detectTone,
  detectMood,
  rgbToHue
};