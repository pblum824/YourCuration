// PhotoUploader.jsx
import React, { useState } from 'react';
import { generateTimestampedFilename } from './utils/generateSafeFilename';

const isRoughlyThreeByTwo = (width, height) => {
  const ratio = width / height;
  return ratio > 1.45 && ratio < 1.55; // ~3:2 aspect ratio
};

export default function PhotoUploader({ onUpload }) {
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    const img = new Image();
    const safeName = generateTimestampedFilename(file.name);
    img.onload = () => {
      if (!isRoughlyThreeByTwo(img.width, img.height)) {
        alert("Note: This image isn't close to a 3:2 aspect ratio. For best results, consistent sizing is recommended.");
      }
      onUpload(file, safeName);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer ${dragging ? 'bg-accent' : 'bg-muted'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <p className="text-sm mb-2">Drag & drop a photo here, or click to upload</p>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="photo-upload"
        onChange={handleInputChange}
      />
      <label htmlFor="photo-upload" className="cursor-pointer text-primary font-medium">
        Browse Files
      </label>
    </div>
  );
}
