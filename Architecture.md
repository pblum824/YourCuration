# YourCuration: Architectural Design (2025)

## 🎯 Purpose
YourCuration helps artists match their portfolio to an art collector’s taste using a mixture of:
- Metadata-tagged images
- Artist intent
- Client preference feedback

It evolves through **sample rating, iterative refinement, and guided curation**, adapting both aesthetically and structurally.

---

## 🧱 Vision Feature Map

| Category         | Feature Idea                                        | Purpose                                |
|------------------|-----------------------------------------------------|----------------------------------------|
| Tagging          | Edit, relabel, or add custom tags                  | Artist-directed metadata correction    |
| Sampling         | Artist-picked, rare-tag-based, or system-suggested | Support intent + discovery             |
| Iteration        | Client rates → we refine → suggest next            | Active feedback loop                   |
| Projects         | Group by project to avoid bias                     | Ensure gallery diversity               |
| Learning         | Log corrections for future model fine-tuning       | Trainable data pipeline                |
| UI/UX            | Smooth transitions, button polish, font unification| Encourage ease, not effort             |
| Curation         | Score by tags, weights from feedback               | Shape final gallery                    |

---

## 🧩 Recommended Order of Execution

1. Editable tags interface (add, remove, replace)
2. Project tagging UI or auto-assignment support
3. Rarity-aware sampling algorithm
4. Iterative refinement after SampleRater
5. CuratedGallery scoring + rendering
6. Correction logging + data export bucket
7. Future learning / model adaptation scaffolding

---

## 🔁 Curation Flow Diagram

### Phase 1: Sample Rater
- Six samples: selected by artist, diversity logic, or rarity
- Client rates (Love / Like / Less)
- ↳ **Client Feedback →** stored as `ratings` map

### Phase 2: Gallery 1 — Confirmation
- Images with high similarity to positive feedback
- Small injection of weak matches or rare tags
- ↳ **Client Feedback →** can re-rate, opt in/out

### Phase 3: Gallery 2 — Exploration
- Mostly high match
- Some very weakly related / unexpected pieces
- Checks if client reconsiders boundaries of taste

### Final: YourCuration generates a candidate set for use or export

---

## 🛠️ Implementation Paths

| Task                        | File/Module                         | Status        |
|-----------------------------|-------------------------------------|---------------|
| Editable tags               | `EditableTagList.jsx`, hook TBD     | Planned       |
| Correction logger           | `utils/correctionLog.js`            | Queued        |
| Sample scoring logic        | `utils/scoreImage.js`               | Designing     |
| Curated gallery logic       | `CuratedGallery1.jsx`, `Gallery2.jsx` | Queued        |
| Rarity sampling             | `utils/sampleSelector.js`           | Queued        |
| Project metadata support    | `ProjectTagger.jsx` (planned)       | Planned       |

---

## 🗃️ State Management (via `YourCurationContext.jsx`)

| Key              | Description                                |
|------------------|--------------------------------------------|
| `artistGallery`  | All uploaded images with metadata          |
| `ratings`        | Client’s sample-based feedback             |
| `corrections`    | Tag-level artist edits (future model input)|
| `view`           | Current stage in the curation flow         |

---

## 📦 Export & Import

Artist bundles include:
- Hero image, border, center background
- All gallery and sample images
- Metadata, tags, corrections

Bundles are JSON-based and persistable offline or via external cloud sync later.

---

## 🌐 Backend (Stateless)
- Accepts image uploads
- Runs ONNX inference
- Returns `metadata: { imageTags, textTags, moodTags... }`

---

## ✂️ Cleaned Legacy Code

| Removed             | Reason                       |
|---------------------|------------------------------|
| `PhotoUploader.jsx` | Merged into ArtistDashboard  |
| `GenerateTextTags`  | Combined in `GenerateTags`   |
| `.bak/.temp.jsx`    | Archived                     |

---

## 🧠 Future Ready

- ML fine-tuning based on corrections
- UI tag suggestions from learned history
- Project visualizations (gallery tag maps)
- Intelligent bias prevention per project
