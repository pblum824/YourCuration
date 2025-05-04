# YourCuration Lightsail Inference Blueprint

## Purpose
A validated blueprint for backend image + text tag inference on AWS Lightsail using ONNX models.

---

## Inference Endpoint
`POST /batch-tag`
- Accepts multipart form-data
- Single image file in field: `image`

### Server Input Conversion
```js
const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
```

---

## Model Inference Flow

### Step 1: Run Image Model
```js
const imageTags = await runImageModel(base64);
```

### Step 2: Unload Image Model
```js
runImageModel.unloadModel();
```

### Step 3: Run Text Model
```js
const textTags = await runTextModel("Describe this image in tags");
```

### Step 4: Reload Image Model
```js
await runImageModel.loadModel();
```

---

## Model Files (Excluded from Repo)
- `/models/clip-vit-b32.onnx`
- `/models/clip-text-vit-b32.onnx`

These are downloaded or preloaded on Lightsail, not zipped in archives.

---

## Server Response Format
```json
{
  "metadata": {
    "imageTags": ["sample-tag-1", "sample-tag-2"],
    "textTags": ["text-embedding-vector-received"]
  }
}
```

---

## Session Lifecycle

### Image Model (`runImageModel.js`):
- Loads on server boot or as needed
- Exports:
  ```js
  runImageModel()
  runImageModel.loadModel()
  runImageModel.unloadModel()
  ```

### Text Model (`runTextModel.js`):
- Loads on demand from S3 to `/tmp`
- Released immediately after inference
- Forces `session = null`
- Deletes `.onnx` file
- Optional: `global.gc()`

---

## Stability Notes
- Both models use `{ executionProviders: ['cpu'] }`
- Memory monitored with `process.memoryUsage()`
- Text model requires ~300MB+, image ~250MB+; clean unloading is critical

---

## Frontend Expectations
### Input
- Image file from file picker
- Sent via FormData under name: `image`

### Output
- Renders `imageTags` and `textTags` under thumbnail
- Errors logged per-image if tagging fails

---

## Archival ZIP Naming
Use: `yourcuration-lsYYMMDD.zip`
Exclude:
```bash
-x "models/*" "node_modules/*" "*.zip"
```

---

## Last Validated Version
- `runImageModel.js` — stable with load/unload
- `runTextModel.js` — stable with memory delay
- `server.js` — working orchestration and logging

This archive is your deployment-ready backend.
