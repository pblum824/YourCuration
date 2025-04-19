// utils/clipText.js
import * as ort from 'onnxruntime-web';

export async function loadTextModelSession() {
  const modelPath = 'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx';
  return await ort.InferenceSession.create(modelPath);
}

export async function getTextFeatures(prompts, session) {
  try {
    console.log('[Tokenizer] Running ONNX inference with prompts...');
    const tensor = new ort.Tensor('string', prompts, [prompts.length]);
    const output = await session.run({ input: tensor });
    return output.text_features.data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}