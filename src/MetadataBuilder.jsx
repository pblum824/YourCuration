import React, { useState } from 'react';

export default function MetadataBuilder() {
  const [imageUrl, setImageUrl] = useState(null);
  const [tags, setTags] = useState([]);
  const [dimensions, setDimensions] = useState({});
  const [dominantHue, setDominantHue] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = analyzeImage(ctx, canvas.width, canvas.height, imageData);
        setTags(result.tags);
        setDimensions(result.dimensions);
        setDominantHue(result.dominantHue);
      };
      img.src = reader.result;
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = (ctx, width, height, imageDataFull) => {
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
    const bwRatio = bwScore / (totalPixels);

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
  };

  const detectTone = (brightnessValues, avgBrightness, stdDev, width, imageData) => {
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
  };

  const detectMood = (avgBrightness, stdDev, colorRatio, dominantHue) => {
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

    if (dominantHue !== null && (dominantHue >= 30 && dominantHue <= 70)) {
      mood.push('nostalgic');
    }

    return Array.from(new Set(mood));
  };

  const rgbToHue = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max === min) h = 0;
    else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
    else if (max === g) h = (60 * ((b - r) / (max - min)) + 120) % 360;
    else if (max === b) h = (60 * ((r - g) / (max - min)) + 240) % 360;
    return h;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Metadata Builder (Color + Tone + Mood)</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Preview"
          style={{
            width: '100%',
            maxWidth: '600px',
            marginTop: '1rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem'
          }}
        />
      )}

      {tags.length > 0 && (
        <>
          <h4>Generated Tags:</h4>
          <div style={{
            background: '#eef',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {tags.join(', ')}
          </div>

          <h4>Dimensions Breakdown:</h4>
          <pre style={{
            background: '#f9f9f9',
            padding: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            overflowX: 'auto'
          }}>
            {JSON.stringify(dimensions, null, 2)}
          </pre>

          <h4>Dominant Hue:</h4>
          <div style={{
            background: '#eee',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {dominantHue !== null ? dominantHue : <em>n/a</em>}
          </div>
        </>
      )}
    </div>
  );
}