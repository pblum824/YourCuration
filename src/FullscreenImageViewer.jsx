// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useState } from 'react';
import { loadBlob } from './utils/dbCache';

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

    // Force page chrome to hide (Safari workaround)
    const originalBodyHeight = document.body.style.height;
    document.body.style.height = '200vh';
    setTimeout(() => {
      window.scrollTo(0, 1);
      document.body.style.height = originalBodyHeight;
    }, 150);

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'zoom-out',
        padding: '5vh 0',
        animation: 'fadeIn 0.3s ease-in-out'
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
          transition: 'transform 0.3s ease-out',
        }}
      />
    </div>
  );
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}`;
document.head.appendChild(style);