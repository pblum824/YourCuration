// File: src/YourCurationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const YourCurationContext = createContext();

export function YourCurationProvider({ children }) {
  const [artistGallery, setArtistGallery] = useState(() => {
    const saved = localStorage.getItem('artistGallery');
    return saved ? JSON.parse(saved) : [];
  });

  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('artistGallery', JSON.stringify(artistGallery));
  }, [artistGallery]);

  useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [ratings]);

  // ✅ Add this helper to update image metadata persistently
  const updateImageMetadata = (imageId, metadataUpdate) => {
    setArtistGallery((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, metadata: { ...img.metadata, ...metadataUpdate } }
          : img
      )
    );
  };

  return (
    <YourCurationContext.Provider
      value={{
        artistGallery,
        setArtistGallery,
        ratings,
        setRatings,
        updateImageMetadata,
      }}
    >
      {children}
    </YourCurationContext.Provider>
  );
}

export const useCuration = () => useContext(YourCurationContext);