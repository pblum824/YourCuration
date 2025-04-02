import React from 'react';
import { motion } from 'framer-motion';

const pageFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeInOut' },
};

export default function ArtClientLanding({ onStart }) {
  return (
    <motion.div
      {...pageFade}
      className="flex flex-col items-center justify-center text-center min-h-[70vh] bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8"
    >
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">
        Your gallery starts here
      </h1>
      <p className="text-muted-foreground mb-6">
        Discover which images speak to you — we’ll help curate your personal collection.
      </p>
      <button
        onClick={onStart}
        className="px-6 py-3 rounded-2xl bg-primary text-white shadow hover:bg-primary/90 transition"
      >
        Let’s do this!
      </button>
    </motion.div>
  );
}