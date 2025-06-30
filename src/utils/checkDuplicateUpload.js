// File: src/utils/checkDuplicateUpload.js

/**
 * Checks if any of the new files match existing image names in the gallery.
 * Returns a tuple: [validFiles, duplicateNames]
 */
export function filterDuplicateFiles(files, existingImages) {
  const existingNames = new Set(existingImages.map((img) => img.name));
  const valid = [];
  const duplicates = [];

  for (const file of files) {
    if (existingNames.has(file.name)) {
      duplicates.push(file.name);
    } else {
      valid.push(file);
    }
  }

  return [valid, duplicates];
}