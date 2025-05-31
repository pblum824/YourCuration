import React from 'react';
import { useCuration } from '../YourCurationContext';

export default function GalleryGrid({
  devMode,
  toggleImageScrape,
  toggleImageGallery,
  toggleImageSample,
  removeImage,
  imageButton
}) {
  const { artistGallery } = useCuration();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'flex-end',
        minHeight: '240px',
        marginTop: '2rem'
      }}
    >
      {artistGallery.map((img) => (
        <div
          key={img.id}
          style={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <img
            src={img.url}
            alt={img.name}
            style={{
              height: '200px',
              width: '100%',
              objectFit: 'contain',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}
          />
          <p
            style={{
              marginTop: '0.5rem',
              fontStyle: 'italic',
              fontFamily: 'sans-serif'
            }}
          >
            {img.name}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            <button
              onClick={() => toggleImageScrape(img.id)}
              style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
            >
              {img.scrapeEligible ? 'Accepted' : 'Excluded'}
            </button>
            <button
              onClick={() => removeImage(img.id)}
              style={imageButton('#fee2e2', '#991b1b')}
            >
              Remove
            </button>
            <button
              onClick={() => toggleImageGallery(img.id)}
              style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
            >
              Gallery
            </button>
            <button
              onClick={() => toggleImageSample(img.id)}
              style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
            >
              Sample
            </button>
          </div>

          {devMode && (
            <pre
              style={{
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                textAlign: 'left'
              }}
            >
              {JSON.stringify(img.metadata, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}