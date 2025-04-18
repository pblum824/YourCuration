// utils/clipText.js
import * as ort from 'onnxruntime-web';

export async function getTextFeatures(session, prompts) {
  try {
    console.log('[Tokenizer] Running ONNX inference with prompts...');

    const inputTensor = new ort.Tensor('string', prompts, [prompts.length]);
    const output = await session.run({ input: inputTensor });

    console.log('[Tokenizer] Inference output:', output);
    return output.text_embeds.data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}

export async function getImageFeatures(session, imageTensor) {
  try {
    const inputName = session.inputNames[0];
    const output = await session.run({ [inputName]: imageTensor });

    console.log('[Tokenizer] Image inference output:', output);
    return output.image_embeds.data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getImageFeatures:', err);
    return [];
  }
}
