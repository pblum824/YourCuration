// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useState } from 'react';
import { loadBlob } from './utils/dbCache';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);

  useEffect(() => {
    let objectUrl;
    async function fetchFullImage() {
      if (!image?.localRefId) return;
      const blob = await loadBlob(image.localRefId);
      if (!blob) return;
      objectUrl = URL.createObjectURL(blob);
      setFullUrl(objectUrl);
    }
    fetchFullImage();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      document.body.style.overflow = originalOverflow;
    };
  }, [image]);

  if (!fullUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'zoom-out',
      }}
    >
      <TransformWrapper
        wheel={{ disabled: false }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        panning={{ disabled: false }}
      >
        <TransformComponent>
          <img
            src={fullUrl}
            alt={image.name}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '0.5rem',
              boxShadow: '0 0 20px rgba(0,0,0,0.6)',
              objectFit: 'contain',
              touchAction: 'none'
            }}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
