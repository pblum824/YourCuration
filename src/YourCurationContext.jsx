import React, { createContext, useContext, useState } from 'react';

const CurationContext = createContext();

export function YourCurationProvider({ children }) {
  const [artistGallery, setArtistGallery] = useState([]);
  const [ratings, setRatings] = useState({});
  const [galleryRatings, setGalleryRatings] = useState({});
  const [cg1Selections, setCG1Selections] = useState({});
  const [cg2Selections, setCG2Selections] = useState({}); // optional future

  return (
    <CurationContext.Provider
      value={{
        artistGallery,
        setArtistGallery,
        ratings,
        setRatings,
        galleryRatings,
        setGalleryRatings,
        cg1Selections,
        setCG1Selections,
        cg2Selections,
        setCG2Selections, // optional for next step
      }}
    >
      {children}
    </CurationContext.Provider>
  );
}

export function useCuration() {
  return useContext(CurationContext);
}