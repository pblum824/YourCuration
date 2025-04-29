// netlify/functions/tagImage.js
const ort = require('onnxruntime-node');
const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('canvas');

let session = null;

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { base64Image } = JSON.parse(event.body);

    if (!session) {
      console.log('Loading ONNX model from S3...');
      const response = await fetch('https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-vit-b32.onnx');
      const buffer = await response.buffer();
      session = await ort.InferenceSession.create(buffer);
      console.log('Model loaded into memory.');
    }

    const tensor = await preprocessImage(base64Image);
    console.log('Image preprocessed into tensor.');

    const output = await session.run({ image: tensor });
    console.log('ONNX inference complete.');

    const metadata = extractMetadata(output);
    console.log('Metadata extraction complete.');

    return {
      statusCode: 200,
      body: JSON.stringify({ metadata })
    };
  } catch (err) {
    console.error('Error during inference:', err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

// Helper to preprocess base64 image into ONNX tensor
async function preprocessImage(base64) {
  const img = await loadImage(base64);
  const canvas = createCanvas(224, 224);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 224, 224);

  const imageData = ctx.getImageData(0, 0, 224, 224).data;
  const floatData = new Float32Array(3 * 224 * 224);

  for (let i = 0; i < 224 * 224; i++) {
    floatData[i] = imageData[i * 4] / 255.0;         // R
    floatData[i + 224 * 224] = imageData[i * 4 + 1] / 255.0; // G
    floatData[i + 2 * 224 * 224] = imageData[i * 4 + 2] / 255.0; // B
  }

  const tensor = new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
  return tensor;
}

// Helper to create dummy metadata
function extractMetadata(output) {
  // You'll customize this later
  const dummyTags = ["sample-tag-1", "sample-tag-2"];
  return { tags: dummyTags };
}