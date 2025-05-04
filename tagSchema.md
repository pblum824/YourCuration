# YourCuration Tag Schema Reference

Each image in the YourCuration app (whether in samples or gallery) can carry multiple categories of metadata tags.

This schema standardizes how tags are stored under `image.metadata`.

---

## Supported Tag Containers

### 1. **Image Tags**
- Inferred by ONNX image model
- Based on visual pattern matching
```json
imageTags: ["rule-of-thirds", "monochrome", "portrait"]
```

### 2. **Text Tags**
- Inferred by ONNX text model (text embeddings)
- Derived from prompt matching or textual context
```json
textTags: ["nostalgic", "art deco"]
```

### 3. **Color / Tone Dimensions**
- Auto-generated using perceptual features (e.g., HSV, luminance)
```json
dimensions: {
  mood: ["calm", "moody"],
  visualTone: ["soft", "cinematic"],
  colorPalette: ["cool", "muted"]
}
```

### 4. **Artist-Labeled Tags**
- User-curated or imported manually
- Supports subjective, thematic, or series labels
```json
artistTags: ["Series 3", "Mixed Media", "Identity"]
```

---

## Sample Metadata Object

```json
metadata: {
  imageTags: ["backlit", "negative-space"],
  textTags: ["contemplative"],
  dimensions: {
    mood: ["ethereal"],
    visualTone: ["dreamy"],
    colorPalette: ["pastel"]
  },
  artistTags: ["Spring 2024", "Panel Work"]
}
```

---

## Notes
- All tag groups are optional
- All tags should be lowercase, hyphenated, and normalized
- Tag sources should not overwrite each other — tags should merge when possible

This schema ensures consistent tag handling across upload, tagging, rating, and curation.