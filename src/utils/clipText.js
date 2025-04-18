import * as ort from 'onnxruntime-web';

// Prompts will be passed in by the caller
export async function getTextFeatures(prompts, session) {
  console.log('[Tokenizer] Initializing tokenizer...');
  const tokenizer = new BertTokenizer();

  console.log('[Tokenizer] Encoding prompts:', prompts);
  const inputIds = prompts.map(p => {
    const encoded = tokenizer.encode(p);
    console.log(`[Tokenizer] Encoded "${p}" →`, encoded);
    return encoded;
  });

  const maxLen = Math.max(...inputIds.map(seq => seq.length));
  console.log('[Tokenizer] Max length:', maxLen);

  const paddedInput = flattenAndPad(inputIds, maxLen);
  console.log('[Tokenizer] Flattened input:', paddedInput);

  const inputTensor = new ort.Tensor('int64', paddedInput, [prompts.length, maxLen]);

  const attention = inputIds.map(seq => {
    const mask = new Array(maxLen).fill(0);
    for (let i = 0; i < seq.length; i++) mask[i] = 1;
    return mask;
  });
  const flatMask = attention.flat();
  console.log('[Tokenizer] Flattened attention mask:', flatMask);

  const maskTensor = new ort.Tensor('int64', flatMask, [prompts.length, maxLen]);

  console.log('[Tokenizer] Running ONNX inference with input_ids and attention_mask...');
  try {
    const output = await session.run({
      input_ids: inputTensor,
      attention_mask: maskTensor,
    });
    console.log('[Tokenizer] Inference output:', output);
    return output['text_embeds'].data;
  } catch (err) {
    console.error('[Tokenizer] FAILED during getTextFeatures:', err);
    return [];
  }
}

function flattenAndPad(sequences, length) {
  return sequences.flatMap(seq => {
    const padded = new Array(length).fill(0);
    for (let i = 0; i < seq.length; i++) padded[i] = seq[i];
    return padded;
  });
}

// Basic BERT-style tokenizer (simplified)
class BertTokenizer {
  constructor() {
    this.vocab = {};
    this.invVocab = [];
    this.loadVocab();
  }

  loadVocab() {
    const words = [
      '[PAD]', '[UNK]', '[CLS]', '[SEP]', '[MASK]',
      'a', 'an', 'the', 'person', 'animal', 'dog', 'cat',
      'running', 'protesting', 'hugging', 'group', 'tree', 'sunset',
      'shadow', 'abstract'
    ];
    words.forEach((w, i) => {
      this.vocab[w] = i;
      this.invVocab[i] = w;
    });
    console.log('[Tokenizer] Vocabulary loaded:', this.vocab);
  }

  encode(text) {
    const tokens = ['[CLS]', ...text.toLowerCase().split(/\W+/), '[SEP]'];
    const encoded = tokens.map(t => this.vocab[t] ?? this.vocab['[UNK]']);
    console.log(`[Tokenizer] Tokens for "${text}":`, tokens);
    console.log(`[Tokenizer] Encoded IDs:`, encoded);
    return encoded;
  }
}