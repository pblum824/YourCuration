import React, { useState } from 'react';

export default function MetadataBuilder() {
  const [imageUrl, setImageUrl] = useState(null);
  const [tags, setTags] = useState([]);
  const [dimensions, setDimensions] = useState({});

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
        const { tags, dimensions } = analyzeImage(ctx, canvas.width, canvas.height);
        setTags(tags);
        setDimensions(dimensions);
      };
      img.src = reader.result;
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = (ctx, width, height) => {
    const data = ctx.getImageData(0, 0, width, height).data;
    const totalPixels = width * height;
    const colorCounts = {};

    let brightnessSum = 0;
    let brightnessValues = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      brightnessSum += brightness;
      brightnessValues.push(brightness);

      const key = `${Math.round(r / 32) * 32}-${Math.round(g / 32) * 32}-${Math.round(b / 32) * 32}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    const avgBrightness = brightnessSum / totalPixels;
    const stdDev = Math.sqrt(
      brightnessValues.reduce((sum, val) => sum + Math.pow(val - avgBrightness, 2), 0) / totalPixels
    );

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

    const tags = [];
    const dimensions = {
      colorPalette: [],
      visualTone: [],
      mood: [],
      subject: [],
      message: []
    };

    topColors.forEach(({ hue, saturation }) => {
      if (saturation < 0.12) {
        dimensions.colorPalette.push('monochrome');
        tags.push('monochrome');
      } else if (hue >= 0 && hue < 50) {
        dimensions.colorPalette.push('warm tones');
        tags.push('warm tones');
      } else if (hue >= 180 && hue < 260) {
        dimensions.colorPalette.push('cool tones');
        tags.push('cool tones');
      } else {
        dimensions.colorPalette.push('neutral');
        tags.push('neutral');
      }
    });

    // Tone detection
    if (stdDev > 50) {
      dimensions.visualTone.push('high contrast');
      tags.push('high contrast');
    } else if (stdDev < 25) {
      dimensions.visualTone.push('soft-focus');
      tags.push('soft-focus');
    }

    if (avgBrightness < 60 && stdDev > 40) {
      dimensions.visualTone.push('grainy');
      tags.push('grainy');
    }

    // Rudimentary backlight guess: bright edges + dark center
    const edgeBrightness = (
      brightnessValues.slice(0, width).concat( // top row
      brightnessValues.slice(-width))         // bottom row
    ).reduce((sum, b) => sum + b, 0) / (2 * width);

    const centerBrightness = brightnessValues[Math.floor(brightnessValues.length / 2)];

    if (edgeBrightness > centerBrightness + 30) {
      dimensions.visualTone.push('backlit');
      tags.push('backlit');
    }

    return {
      tags: Array.from(new Set(tags)),
      dimensions
    };
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
      <h2>Metadata Builder (Color + Tone)</h2>

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
        </>
      )}
    </div>
  );
}