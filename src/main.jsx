import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Test overlay — this should render no matter what
document.body.innerHTML = "<h1 style='padding:2rem; color:blue;'>Overlay is working</h1>";

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
} catch (err) {
  document.body.innerHTML = `
    <pre style="padding: 2rem; font-size: 1.1rem; color: red; background: #fff;">
      ${err.message}
    </pre>
  `;
}