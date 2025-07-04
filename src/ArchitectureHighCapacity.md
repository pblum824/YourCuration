YourCuration 2K Image Scaling Plan

🎯 Objective

Enable YourCuration to reliably handle 1,000–2,000 artist images while maintaining client-ready offline performance.

Motto: “Prepare online, present offline.”

⸻

🔧 Core Requirements

Capability	Description
Upload Queue	Handle drag-and-drop of 2K files w/ deduplication and async compression
Offline Bundle Readiness	Store only necessary data for offline client view
Metadata Tagging	Chunked upload to API, async processing, resilient retry
Rendering Performance	Virtualized scroll grid for dev/artist views
Client Mode	Always offline-ready, minimal DOM, final gallery only
Flexible Image Storage	Abstracted storage layer: IndexedDB, zip archive, File System Access API
Export/Import Bundling	Strategy-specific export (JSON + blob or ZIP) + reimport handler


⸻

🧠 Key Concepts

1. Virtualized Rendering
  •	Implement react-window in GalleryGrid.jsx
  •	Display only visible image rows (~15–20)
  •	DOM stays fast at all times

2. Storage Strategy Adapter
  •	Unified API: loadImage(id), saveImage(id, blob), deleteImage(id)
  •	imageStore.js chooses backing store dynamically:
  •	indexeddb
  •	zip
  •	filesystem

3. Bundle Export Strategies
  •	Embed export strategy metadata: { strategy: 'zip' }
  •	zip = JSON + compressed image files
  •	indexeddb = bundle references pre-cached blobs
  •	filesystem = app connects to folder via File System Access API

⸻

📦 Architecture Overview

Artist Dashboard
  ↳ Drag & Drop Upload
       ↳ compressImage()
       ↳ saveImage() ← imageStore strategy

  ↳ Export Gallery
       ↳ exportGalleryData()
       ↳ { images[], strategy, metadata }
       ↳ output: .json or .zip

  ↳ Import Gallery
       ↳ parse bundle
       ↳ setImageStorageMode(bundle.strategy)
       ↳ hydrate blobs

GalleryGrid (virtualized)
  ↳ loadImage(id) → imageStore strategy

Client Mode (CuratedGalleryFinal)
  ↳ display top 20
  ↳ fonts embedded
  ↳ no network dependency


⸻

🚀 Implementation Steps

Phase 1: Refactor Core Logic
  •	Abstract loadBlob/saveBlob to imageStore
  •	Inject setImageStorageMode() from bundle

Phase 2: Virtual Rendering
  •	Install react-window
  •	Patch GalleryGrid to use FixedSizeGrid

Phase 3: ZIP Bundle Support
  •	Create zipStore.js module
  •	Support export to .zip
  •	Hydrate from imported .zip

Phase 4: File System Access API (opt-in)
  •	Create fsStore.js
  •	Prompt folder selection
  •	Stream save/load images to disk

Phase 5: UI Feedback + Warnings
  •	Add storage quota estimator
  •	Show offline-ready checklist (font loaded, blobs cached, etc)

⸻

🧾 Notes
  •	Metadata for all 2K images is lightweight (~3–5MB JSON)
  •	Only ~40–100 images shown to Client
  •	Everything else is optimization for prep, not presentation

⸻

🏁 End Goal

A scalable, offline-first, artist-grade image curation tool that can:
  •	Analyze 2K+ images
  •	Generate high-fidelity metadata
  •	Score and curate based on SampleRater
  •	Export and re-import bundles reliably
  •	Always deliver a Parisienne-perfect client presentation