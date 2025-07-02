// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { loadBlob } from './utils/dbCache';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);
  const containerRef = useRef(null);

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

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [image]);

  if (!fullUrl) return null;

  return (
    <div
      ref={containerRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'zoom-out',
        overflow: 'hidden',
      }}
    >
      <img
        src={fullUrl}
        alt={image.name}
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}