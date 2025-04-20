// utils/clipImage.js
import { loadImageModelSession } from "../utils/onnxHelpers";
import * as ort from "onnxruntime-web";

export async function getImageFeatures(imageTensor) {
  try {
    const session = await loadImageModelSession(
      "https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-vit-b32.onnx"
    );

    const feeds = { image: imageTensor };
    const output = await session.run(feeds);
    return output["image_features"].data;
  } catch (err) {
    console.error("[CLIP] Failed during getImageFeatures:", err);
    return [];
  }
}
