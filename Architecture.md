# YourCuration: Project Architecture

## Purpose
YourCuration helps artists match their gallery to an art collector's taste using metadata-tagged sample images. The system collects a curator’s preferences and filters the artist’s portfolio accordingly.

## Key Components

- **ArtistDashboard**: Central hub where artists upload sample and gallery images, mark scrape-eligible items, manage hero/border/center visuals, and export/import galleries.
- **GenerateTags**: Sends images to the backend for ONNX-based metadata tagging.
- **SampleRater**: Allows collectors to rate sample images (like/dislike).
- **CuratedGallery**: Compares ratings and metadata to display personalized results.
- **App**: Controls view navigation and wraps the entire app in global state.

## State Management

All core state is managed with **React Context** via `YourCurationContext.jsx`, which syncs to `localStorage` using `storageService.js`.

### Context Keys:
- `artistSamples`: Sample images + metadata
- `artistGallery`: Portfolio images + metadata
- `ratings`: Collector's image preferences
- `curatedResults`: (optional) cached result set

## Data Flow

1. **Image Upload**: Handled entirely in `ArtistDashboard`.
2. **Tag Inference**: `GenerateTags` runs metadata tagging and updates global state.
3. **Sample Rating**: `SampleRater` records collector feedback.
4. **Curation**: `CuratedGallery` filters portfolio based on matched metadata.

## Offline Capability

- All data is persisted in `localStorage`
- Enables full offline reuse after preparation
- Architecture follows the “Prepare online. Use offline.” philosophy

## Backend Responsibilities

- Receives image uploads and runs ONNX-based inference
- Returns imageTags + textTags for metadata
- Backend is stateless and ephemeral (no DB dependency)

## Cleaned & Removed

- ❌ `PhotoUploader.jsx` (merged into `ArtistDashboard`)
- ❌ `AppReadyState.jsx` (retired)
- ❌ `GenerateTextTags.jsx` (consolidated into `GenerateTags`)
- ❌ legacy `.bak` and `.temp.jsx` versions

## Future Considerations

- Enable cloud-based export/import (e.g., Dropbox or S3 integration)
- Add role-based views (Artist vs Collector login modes)
- Introduce tag visualization or clustering (for deeper curation insight)