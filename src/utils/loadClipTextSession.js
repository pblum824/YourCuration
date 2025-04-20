// utils/loadClipTextSessions.js
import { loadTextModelSession } from "../utils/onnxHelpers";

let tokenizerSession = null;
let textSession = null;
let vocabMap = null;

export async function loadClipTextSession() {
  if (tokenizerSession && textSession && vocabMap) {
    return { tokenizerSession, textSession, vocabMap };
  }

  console.log('[Tokenizer] Loading CLIP tokenizer and text encoder...');

  const session = await loadTextModelSession(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx'
  );

  tokenizerSession = session;
  textSession = session;

  const vocabResponse = await fetch(
    'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-tokenizer-vocab.json'
  );
  const vocabJson = await vocabResponse.json();
  vocabMap = new Map(Object.entries(vocabJson));

  console.log('[Tokenizer] Model sessions and vocabMap ready.');

  return { tokenizerSession, textSession, vocabMap };
}
