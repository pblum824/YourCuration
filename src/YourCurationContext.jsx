// File: src/YourCurationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const YourCurationContext = createContext();

export function YourCurationProvider({ children }) {
  const [artistGallery, setArtistGallery] = useState([]);
  const [artistSamples, setArtistSamples] = useState([]);
  const [ratings, setRatings] = useState({});
  const [cg1Selections, setCG1Selections] = useState({});
  const [cg2Selections, setCG2Selections] = useState({});
  const [mode, setMode] = useState('artist'); // 'artist' or 'client'
  const [galleryTotalSize, setGalleryTotalSize] = useState(0); // ⬅️ new line

  return (
    <YourCurationContext.Provider
      value={{
        artistGallery,
        setArtistGallery,
        artistSamples,
        setArtistSamples,
        ratings,
        setRatings,
        cg1Selections,
        setCG1Selections,
        cg2Selections,
        setCG2Selections,
        mode,
        setMode,
        galleryTotalSize,         // ⬅️ new context export
        setGalleryTotalSize       // ⬅️ new updater
      }}
    >
      {children}
    </YourCurationContext.Provider>
  );
}

export function useCuration() {
  return useContext(YourCurationContext);
}