// File: src/FullscreenImageViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { loadBlob } from './utils/dbCache';

export default function FullscreenImageViewer({ image, onClose }) {
  const [fullUrl, setFullUrl] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const scale = useRef(1);
  const origin = useRef({ x: 0, y: 0 });
  const lastTouch = useRef(null);

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

  const onWheel = (e) => {
    e.preventDefault();
    scale.current = Math.max(1, Math.min(5, scale.current - e.deltaY * 0.001));
    imgRef.current.style.transform = `scale(${scale.current})`;
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startScrollX = containerRef.current.scrollLeft;
    const startScrollY = containerRef.current.scrollTop;

    const onMouseMove = (moveEvent) => {
      containerRef.current.scrollLeft = startScrollX - (moveEvent.clientX - startX);
      containerRef.current.scrollTop = startScrollY - (moveEvent.clientY - startY);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      lastTouch.current = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    } else if (e.touches.length === 1) {
      origin.current.x = e.touches[0].clientX;
      origin.current.y = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouch.current) {
      const [a, b] = e.touches;
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      scale.current = Math.max(1, Math.min(5, (scale.current * dist) / lastTouch.current));
      imgRef.current.style.transform = `scale(${scale.current})`;
      lastTouch.current = dist;
    } else if (e.touches.length === 1) {
      const dx = origin.current.x - e.touches[0].clientX;
      const dy = origin.current.y - e.touches[0].clientY;
      containerRef.current.scrollLeft += dx;
      containerRef.current.scrollTop += dy;
      origin.current.x = e.touches[0].clientX;
      origin.current.y = e.touches[0].clientY;
    }
  };

  if (!fullUrl) return null;

  return (
    <div
      ref={containerRef}
      onClick={onClose}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        overflow: 'scroll',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'zoom-out',
        padding: '5vh 0',
        touchAction: 'none',
      }}
    >
      <img
        ref={imgRef}
        src={fullUrl}
        alt={image.name}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '0.5rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          transition: 'transform 0.2s ease-out',
          touchAction: 'none',
        }}
      />
    </div>
  );
}