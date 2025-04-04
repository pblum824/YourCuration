import React from 'react';

const pageFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeInOut' },
};

export default function ArtClientLanding({ onStart }) {
  return (
    <div
      className="min-h-[70vh] flex flex-col justify-center items-center text-center gap-8"
      style={{ fontFamily: 'Parisienne, cursive' }}
    >
      <h1 className="text-4xl text-primary font-bold text-shadow">
        Your gallery starts here
      </h1>
      <p className="text-xl text-muted-foreground max-w-xl">
        Discover which images speak to you — we’ll help curate your personal collection.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-primary text-white text-2xl rounded-xl shadow hover:bg-primary/90 transition"
      >
        Let’s do this!
      </button>
    </div>
  );
}