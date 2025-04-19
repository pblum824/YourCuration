// utils/clipText.js
import * as ort from 'onnxruntime-web';

let textSession = null;

// Load the ONNX model for text once per session
export async function loadTextModelSession() {
  if (textSession) return textSession;

  console.log('[CLIP] Loading text model session...');
  textSession = await ort.InferenceSession.create(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx'
  );
  console.log('[CLIP] Text model session loaded');
  return textSession;
}

// Prepare input tensors and run inference
export async function getTextFeatures(prompts, session) {
  try {
    console.log('[Tokenizer] Running ONNX inference with prompts...');
    const input = new ort.Tensor('string', prompts, [prompts.length]);
    const output = await session.run({ text_input: input });

    const features = output.text_features?.data || [];
    return Array.from({ length: prompts.length }, (_, i) =>
      features.slice(i * 512, (i + 1) * 512)
    );
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}