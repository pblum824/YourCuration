// utils/clipText.js
import * as ort from 'onnxruntime-web';

let textModelSession = null;

export async function loadTextModelSession() {
  if (textModelSession) return textModelSession;
  textModelSession = await ort.InferenceSession.create(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx'
  );
  return textModelSession;
}

export async function getTextFeatures(prompts, session) {
  try {
    console.log('[Tokenizer] Running ONNX inference with prompts...');

    const tensor = new ort.Tensor('string', prompts, [prompts.length]);
    const feeds = { text: tensor };

    const output = await session.run(feeds);
    const embeddings = output['text_features'].data;
    const dim = output['text_features'].dims[1];
    const reshaped = [];
    for (let i = 0; i < embeddings.length; i += dim) {
      reshaped.push(embeddings.slice(i, i + dim));
    }
    return reshaped;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}
