// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { loadBlob } from './utils/dbCache';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef(null);
  const lastTouchPos = useRef(null);
  const isDragging = useRef(false);

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

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    setScale((prev) => Math.max(1, Math.min(prev - delta * 0.1, 5)));
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastTouchPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastTouchPos.current.x;
    const dy = e.clientY - lastTouchPos.current.y;
    lastTouchPos.current = { x: e.clientX, y: e.clientY };
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e);
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1) {
      lastTouchPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e);
      const delta = dist - lastTouchDist.current;
      setScale((prev) => Math.max(1, Math.min(prev + delta / 200, 5)));
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && lastTouchPos.current) {
      const dx = e.touches[0].clientX - lastTouchPos.current.x;
      const dy = e.touches[0].clientY - lastTouchPos.current.y;
      lastTouchPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const getTouchDistance = (e) => {
    const [a, b] = e.touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  if (!fullUrl) return null;

  return (
    <div
      ref={containerRef}
      onClick={onClose}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
        touchAction: 'none',
      }}
    >
      <img
        ref={imgRef}
        src={fullUrl}
        alt={image.name}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: 'center center',
          maxWidth: 'none',
          maxHeight: 'none',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          transition: 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
}