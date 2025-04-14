import * as ort from 'onnxruntime-web';

// Prompts will be passed in by the caller
export async function getTextFeatures(prompts, session) {
  // Tokenizer config for BERT-style tokenization
  const tokenizer = new BertTokenizer();
  const inputIds = prompts.map(p => tokenizer.encode(p));

  // Pad sequences to the same length
  const maxLen = Math.max(...inputIds.map(seq => seq.length));
  const inputTensor = new ort.Tensor('int64', flattenAndPad(inputIds, maxLen), [prompts.length, maxLen]);

  // Run inference
  const output = await session.run({ input_ids: inputTensor });
  return output['text_features'].data;
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
    const words = ['[PAD]', '[UNK]', '[CLS]', '[SEP]', '[MASK]', 'a', 'an', 'the', 'person', 'animal', 'dog', 'cat', 'running', 'protesting', 'hugging', 'group', 'tree', 'sunset', 'shadow', 'abstract'];
    words.forEach((w, i) => {
      this.vocab[w] = i;
      this.invVocab[i] = w;
    });
  }

  encode(text) {
    const tokens = ['[CLS]', ...text.toLowerCase().split(/\W+/), '[SEP]'];
    return tokens.map(t => this.vocab[t] ?? this.vocab['[UNK]']);
  }
}
