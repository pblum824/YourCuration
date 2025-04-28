// utils/onnxHelpers.js
import * as ort from "onnxruntime-web";
import { getTextFeatures } from "./clipText";
import { TAG_PROMPTS, ACTION_PROMPTS } from "./tagPrompts";

// Safari compatibility
ort.env.wasm.numThreads = 1;

export async function loadTextModelSession(modelUrl) {
  try {
    const session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ["wasm"],
    });
    console.log("[CLIP] Text model loaded.");
    return session;
  } catch (err) {
    console.error("[CLIP] Failed to load text model:", err);
    throw err;
  }
}

export async function loadImageModelSession(modelUrl) {
  try {
    const session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ["wasm"],
    });
    console.log("[CLIP] Image model session loaded");
    return session;
  } catch (err) {
    console.error("[CLIP] Failed to load image model:", err);
    throw err;
  }
}

export async function getCLIPTags(base64Image, imageSession, textSession) {
  try {
    if (!imageSession || !textSession) {
      throw new Error("Missing ONNX model sessions.");
    }

    const allPrompts = TAG_PROMPTS.concat(ACTION_PROMPTS);
    const textEmbeddings = await getTextFeatures(allPrompts);

    const image = await loadImage(base64Image);
    const imageTensor = preprocessImage(image);
    console.log('[CLIP] Running ONNX inference...');
    const output = await imageSession.run({ image: tensor });
    console.log('[CLIP] Inference completed.');
    const imageFeature = normalize(output.image_features.data);

    const similarities = textEmbeddings.map(textVec =>
      cosineSimilarity(imageFeature, textVec)
    );

    const topIndices = getTopNIndices(similarities, 5);
    const topTags = topIndices.map(i => allPrompts[i]);

    console.log("[CLIP] Top tags:", topTags);
    return topTags;
  } catch (err) {
    console.error("[CLIP] getCLIPTags error:", err);
    return ["clip-error"];
  }
}

// Helpers
function normalize(arr) {
  const norm = Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0));
  return arr.map(val => val / norm);
}

function cosineSimilarity(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function getTopNIndices(arr, n) {
  return arr.map((val, i) => [val, i])
            .sort((a, b) => b[0] - a[0])
            .slice(0, n)
            .map(pair => pair[1]);
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

function preprocessImage(image) {
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, 224, 224);
  const imageData = ctx.getImageData(0, 0, 224, 224).data;

  // Normalize to float32 [0,1]
  const floatArray = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    floatArray[i] = imageData[i * 4] / 255;       // R
    floatArray[i + 224 * 224] = imageData[i * 4 + 1] / 255; // G
    floatArray[i + 2 * 224 * 224] = imageData[i * 4 + 2] / 255; // B
  }

  return new ort.Tensor("float32", floatArray, [1, 3, 224, 224]);
}