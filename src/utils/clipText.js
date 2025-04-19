// utils/clipText.js
import * as ort from 'onnxruntime-web';

// Load ONNX CLIP text model session
export async function loadTextModelSession() {
  console.log('[Tokenizer] Loading ONNX CLIP text model...');
  const session = await ort.InferenceSession.create(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx'
  );
  console.log('[Tokenizer] Model loaded.');
  return session;
}

// Get text features from a list of prompts
export async function getTextFeatures(prompts) {
  try {
    const session = await loadTextModelSession();

    console.log('[Tokenizer] Running ONNX inference with prompts...');
    const input = new ort.Tensor('string', prompts, [prompts.length]);
    const output = await session.run({ text_input: input });

    if (!output || !output.text_features || !output.text_features.data) {
      throw new Error('Missing text_features in model output');
    }

    return output.text_features.data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}