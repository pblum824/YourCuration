// utils/imageProcessing.js
import * as ort from 'onnxruntime-web';

export async function preprocessImage(img, targetSize = 224) {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, targetSize, targetSize);

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const { data } = imageData;

  const float32Data = new Float32Array(targetSize * targetSize * 3);

  for (let i = 0; i < targetSize * targetSize; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    float32Data[i * 3] = (r / 255 - 0.5) / 0.5;
    float32Data[i * 3 + 1] = (g / 255 - 0.5) / 0.5;
    float32Data[i * 3 + 2] = (b / 255 - 0.5) / 0.5;
  }

  const tensor = new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
  return tensor;
}