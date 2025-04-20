// utils/clipText.js
import { loadTextModelSession } from "../utils/onnxHelpers";
import * as ort from "onnxruntime-web";

// Prepare input tensors and run inference
export async function getTextFeatures(prompts) {
  try {
    const session = await loadTextModelSession(
      "https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx"
    );

    console.log("[Tokenizer] Running ONNX inference with prompts...");
    const input = new ort.Tensor("string", prompts, [prompts.length]);
    const output = await session.run({ text_input: input });

    const features = output.text_features?.data || [];
    return Array.from({ length: prompts.length }, (_, i) =>
      features.slice(i * 512, (i + 1) * 512)
    );
  } catch (err) {
    console.error("[Tokenizer] FAILED during getTextFeatures:", err);
    return [];
  }
}