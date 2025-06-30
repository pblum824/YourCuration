// File: src/utils/checkDuplicateUpload.js

/**
 * Checks if any of the new files match existing image names in the gallery.
 * Returns a tuple: [validFiles, duplicateNames]
 */
export function filterDuplicateFiles(files, currentGallery) {
  const currentNames = new Set(currentGallery.map((img) => img.name));
  const valid = [];
  const duplicates = [];

  for (const file of files) {
    if (currentNames.has(file.name)) {
      duplicates.push(file.name); // instead of file
    } else {
      valid.push(file);
    }
  }

  return [valid, duplicates];
}