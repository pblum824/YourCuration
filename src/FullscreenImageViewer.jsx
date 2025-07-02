// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { loadBlob } from './utils/dbCache';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);
  const viewerRef = useRef(null);
  const imgRef = useRef(null);
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });

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

  const handleMouseDown = (e) => {
    startRef.current = { x: e.clientX, y: e.clientY };
    viewerRef.current.style.cursor = 'grabbing';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    positionRef.current = {
      x: positionRef.current.x + dx,
      y: positionRef.current.y + dy,
    };
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scaleRef.current})`;
    }
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    viewerRef.current.style.cursor = 'zoom-out';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scaleRef.current = Math.min(Math.max(1, scaleRef.current + delta), 5);
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scaleRef.current})`;
    }
  };

  if (!fullUrl) return null;

  return (
    <div
      ref={viewerRef}
      onClick={onClose}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
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
        ref={imgRef}
        src={fullUrl}
        alt={image.name}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          transition: 'transform 0.2s ease-out',
        }}
      />
    </div>
  );
}