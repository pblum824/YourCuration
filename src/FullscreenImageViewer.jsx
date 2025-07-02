// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { loadBlob } from './utils/dbCache';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

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

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(scale + e.deltaY * -0.001, 1), 4);
    setScale(newScale);
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    containerRef.current.releasePointerCapture(e.pointerId);
  };

  const handleClick = () => {
    if (scale === 1) onClose();
  };

  if (!fullUrl) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
        overflow: 'hidden',
        cursor: scale > 1 ? 'grab' : 'zoom-out',
      }}
    >
      <img
        ref={imgRef}
        src={fullUrl}
        alt={image.name}
        style={{
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          touchAction: 'none',
          userSelect: 'none',
          pointerEvents: 'auto',
        }}
      />
    </div>
  );
}