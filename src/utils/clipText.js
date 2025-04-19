// utils/clipText.js
import * as ort from 'onnxruntime-web';

// Load the ONNX text model (CLIP text encoder)
export async function loadTextModelSession() {
  const session = await ort.InferenceSession.create(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx'
  );
  console.log('[CLIP] Text model session loaded');
  return session;
}

// Load the ONNX image model (CLIP image encoder)
export async function loadImageModelSession() {
  const session = await ort.InferenceSession.create(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-image-vit-b32.onnx'
  );
  console.log('[CLIP] Image model session loaded');
  return session;
}

// Generate text features from prompts using CLIP text model
export async function getTextFeatures(session, prompts) {
  try {
    console.log('[Tokenizer] Running ONNX inference with prompts...');
    const tensor = new ort.Tensor('string', prompts, [prompts.length]);
    const output = await session.run({ text: tensor });
    return output.text_embeds.data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}

// Generate image features from image tensor using CLIP image model
export async function getImageFeatures(session, imageTensor) {
  try {
    const feeds = { [session.inputNames[0]]: imageTensor }; // typically "image"
    const result = await session.run(feeds);
    return result.image_embeds.data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getImageFeatures:', err);
    return [];
  }
}