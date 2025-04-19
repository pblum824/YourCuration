// utils/clipText.js
import * as ort from 'onnxruntime-web';
import { loadTextModelSessions } from './loadClipTextSessions';

let tokenizerSession = null;
let encoderSession = null;

export async function getTextFeatures(prompts) {
  try {
    if (!tokenizerSession || !encoderSession) {
      const sessions = await loadTextModelSessions();
      tokenizerSession = sessions.tokenizerSession;
      encoderSession = sessions.textSession;
    }

    console.log('[Tokenizer] Running ONNX inference with prompts...');
    const inputTensor = new ort.Tensor('string', prompts, [prompts.length]);

    const tokenizerFeeds = { text: inputTensor };
    const tokenizerOutput = await tokenizerSession.run(tokenizerFeeds);
    const { input_ids, attention_mask } = tokenizerOutput;

    const encoderFeeds = { input_ids, attention_mask };
    const encoderOutput = await encoderSession.run(encoderFeeds);

    const embeds = encoderOutput.text_embeds.data;
    return Array.from(embeds);
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}