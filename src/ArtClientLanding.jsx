import React from 'react';
import { motion } from 'framer-motion';

const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

export default function ArtClientLanding({ onStart }) {
  return (
    <motion.div
      {...pageFade}
      className="flex flex-col items-center justify-center text-center space-y-6"
    >
      <h1 className="text-3xl sm:text-4xl font-bold">Your gallery starts here</h1>
      <p className="text-muted-foreground max-w-xl">
        Discover which images speak to you. We'll curate your favorites into a personal gallery.
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