// ArtistDashboard.jsx (updated)
import React from 'react';
import PhotoUploader from './PhotoUploader';

export default function ArtistDashboard() {
  const handlePhotoUpload = (file, sanitizedName) => {
    // Add upload logic here — e.g., saving to state or sending to server
    console.log("Uploaded file:", sanitizedName);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Artist Dashboard</h1>

      <div className="rounded-xl border p-4 bg-muted">
        <h2 className="text-lg font-semibold mb-2">Photo Format Tip</h2>
        <p className="text-sm text-muted-foreground">
          You’re welcome to upload artwork in any dimension. However, for a strong first impression, we recommend using a consistent aspect ratio — such as <strong>2:3</strong> — across your sample images. This helps ArtClients engage more smoothly with your aesthetic.
        </p>
      </div>

      <PhotoUploader onUpload={handlePhotoUpload} />
    </div>
  );
}
