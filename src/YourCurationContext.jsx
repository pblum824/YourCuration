import React, { createContext, useContext, useEffect, useState } from 'react';
import storage from './utils/storageService';

const CurationContext = createContext();

export function YourCurationProvider({ children }) {
  const [artistSamples, setArtistSamples] = useState(storage.getArtistSamples());
  const [artistGallery, setArtistGallery] = useState(storage.getArtistGallery());
  const [ratings, setRatings] = useState(storage.getRatings());
  const [curatedResults, setCuratedResults] = useState([]);

  useEffect(() => {
    storage.setArtistSamples(artistSamples);
  }, [artistSamples]);

  useEffect(() => {
    storage.setArtistGallery(artistGallery);
  }, [artistGallery]);

  useEffect(() => {
    storage.setRatings(ratings);
  }, [ratings]);

  return (
    <CurationContext.Provider
      value={{
        artistSamples,
        setArtistSamples,
        artistGallery,
        setArtistGallery,
        ratings,
        setRatings,
        curatedResults,
        setCuratedResults,
      }}
    >
      {children}
    </CurationContext.Provider>
  );
}

export function useCuration() {
  return useContext(CurationContext);
}