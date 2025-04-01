import React from 'react';
import SampleRater from './SampleRater';

const App = () => {
  const handleSampleComplete = (ratings) => {
    console.log('Ratings received:', ratings);
    // Later: Use these to pick curated artist images
  };

  return (
    <div className="App">
      <SampleRater onComplete={handleSampleComplete} />
    </div>
  );
};

export default App;