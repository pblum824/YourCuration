// File: src/YourCurationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const YourCurationContext = createContext();

export function YourCurationProvider({ children }) {
  const [artistGallery, setArtistGallery] = useState([]);
  const [artistSamples, setArtistSamples] = useState([]);
  const [ratings, setRatings] = useState({});
  const [cg1Selections, setCG1Selections] = useState({});
  const [cg2Selections, setCG2Selections] = useState({});
  const [mode, setMode] = useState('artist');
  const [galleryTotalSize, setGalleryTotalSize] = useState(0);

  const switchToClientMode = () => setMode('client');
  const switchToArtistMode = () => setMode('artist');

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
        switchToClientMode,
        switchToArtistMode,
        galleryTotalSize,
        setGalleryTotalSize
      }}
    >
      {children}
    </YourCurationContext.Provider>
  );
}

export function useCuration() {
  return useContext(YourCurationContext);
}