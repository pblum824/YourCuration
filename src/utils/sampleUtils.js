// File: src/utils/sampleUtils.js

export function toggleSampleWithLimit(id, currentGallery, setGallery, setWarningId) {
  const isAlreadySelected = currentGallery.find((img) => img.id === id)?.sampleEligible;
  const selectedCount = currentGallery.filter((img) => img.sampleEligible).length;

  // If toggling ON and limit is hit
  if (!isAlreadySelected && selectedCount >= 15) {
    setWarningId(id); // display warning below this image
    setTimeout(() => setWarningId(null), 3000);
    return;
  }

  // Proceed with toggling
  setGallery((prev) =>
    prev.map((img) =>
      img.id === id ? { ...img, sampleEligible: !img.sampleEligible } : img
    )
  );
}