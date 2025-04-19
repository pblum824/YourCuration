// utils/clipImage.js
import * as ort from 'onnxruntime-web';

let imageSession = null;

export async function loadImageModelSession() {
  if (imageSession) return imageSession;
  try {
    imageSession = await ort.InferenceSession.create(
      'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-image-vit-b32.onnx'
    );
    console.log('[CLIP] Image model session loaded');
    return imageSession;
  } catch (err) {
    console.error('[CLIP] Failed to load image model session:', err);
    throw err;
  }
}

export async function getImageFeatures(session, imageTensor) {
  try {
    const feeds = { image: imageTensor };
    const output = await session.run(feeds);
    return output['image_features'].data;
  } catch (err) {
    console.error('[CLIP] Failed during getImageFeatures:', err);
    return [];
  }
}
