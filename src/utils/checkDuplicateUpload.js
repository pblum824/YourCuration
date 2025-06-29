// File: src/utils/checkDuplicateUpload.js

/**
 * Detects duplicate filenames in a batch of uploaded files against current gallery.
 * If duplicates exist, returns a list of names that conflict.
 *
 * @param {File[]} newFiles - files selected for upload
 * @param {Array} currentGallery - the artistGallery with current uploads
 * @returns {string[]} - list of duplicate file names
 */
export function getDuplicateFilenames(newFiles, currentGallery) {
  const existingNames = new Set(currentGallery.map((img) => img.name));
  return newFiles.filter((file) => existingNames.has(file.name)).map((file) => file.name);
}

/**
 * Filters out files that would be duplicates, based on file name.
 * Returns only those files safe to upload.
 *
 * @param {File[]} newFiles
 * @param {Array} currentGallery
 * @returns {File[]} files with unique names
 */
export function filterOutDuplicates(newFiles, currentGallery) {
  const existingNames = new Set(currentGallery.map((img) => img.name));
  return newFiles.filter((file) => !existingNames.has(file.name));
}