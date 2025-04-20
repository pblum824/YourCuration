// utils/generateMetadata.js
import { getCLIPTags } from "./onnxHelpers";
import { analyzeVisualMetadataFromImage } from "./analyzeVisualMetadata";

export async function generateMetadata(base64Image, imageSession, textSession) {
  const tags = [];
  let dimensions = {};
  let dominantHue = null;

  try {
    const image = await loadImage(base64Image);
    const visualData = await analyzeVisualMetadataFromImage(image);

    if (visualData?.tags?.length) {
      tags.push(...visualData.tags);
    }

    if (visualData?.dimensions) {
      dimensions = visualData.dimensions;

      const { mood, visualTone, colorPalette } = dimensions;

      if (Array.isArray(mood)) {
        tags.push(...mood.map(m => `mood:${m}`));
      }
      if (Array.isArray(visualTone)) {
        tags.push(...visualTone.map(t => `tone:${t}`));
      }
      if (Array.isArray(colorPalette)) {
        tags.push(...colorPalette.map(c => `palette:${c}`));
      }
    }

    if (visualData?.dominantHue !== undefined) {
      dominantHue = visualData.dominantHue;
      tags.push(`hue:${dominantHue}`);
    }

    const clipTags = await getCLIPTags(base64Image, imageSession, textSession);
    tags.push(...clipTags);
  } catch (err) {
    console.error("[Metadata] generation error:", err);
    tags.push("metadata-error");
  }

  const unique = Array.from(new Set(tags));
  console.log("[Metadata] Final tag set:", unique);

  return {
    tags: unique,
    dimensions,
    dominantHue
  };
}

function loadImage(base64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}
