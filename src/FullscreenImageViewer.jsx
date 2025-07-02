// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { loadBlob } from './utils/dbCache';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);
  const imgRef = useRef(null);
  const scaleRef = useRef(1);
  const startDistRef = useRef(0);

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

  function getDistance(e) {
    const [a, b] = e.touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      startDistRef.current = getDistance(e);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && imgRef.current) {
      const newDist = getDistance(e);
      const scale = Math.min(Math.max((newDist / startDistRef.current) * scaleRef.current, 1), 4);
      imgRef.current.style.transform = `scale(${scale})`;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2 && imgRef.current) {
      const transform = imgRef.current.style.transform;
      const scaleMatch = /scale\(([\d.]+)\)/.exec(transform);
      scaleRef.current = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }
  };

  if (!fullUrl) return null;

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
      }}
    >
      <img
        ref={imgRef}
        src={fullUrl}
        alt={image.name}
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          transition: 'transform 0.3s ease-out',
          touchAction: 'none',
        }}
      />
    </div>
  );
}