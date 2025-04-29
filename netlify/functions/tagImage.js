// netlify/functions/tagImage.js
const ort = require('onnxruntime-node');
const fetch = require('node-fetch');
const Jimp = require('jimp');

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

// Preprocess image using Jimp
async function preprocessImage(base64) {
  const image = await Jimp.read(Buffer.from(base64.split(',')[1], 'base64'));
  image.resize(224, 224);

  const floatData = new Float32Array(3 * 224 * 224);
  let i = 0;
  image.scan(0, 0, 224, 224, function (x, y, idx) {
    floatData[i] = this.bitmap.data[idx] / 255;
    floatData[i + 224 * 224] = this.bitmap.data[idx + 1] / 255;
    floatData[i + 2 * 224 * 224] = this.bitmap.data[idx + 2] / 255;
    i++;
  });

  return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
}

// Temporary metadata extractor (stub)
function extractMetadata(output) {
  // TODO: Replace this with actual tag logic
  return { tags: ['sample-tag-1', 'sample-tag-2'] };
}
