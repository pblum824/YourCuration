// File: styles.js

export const heading = {
  fontSize: '2.25rem',
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#1e3a8a',
  fontFamily: 'Parisienne, cursive',
};

export const section = {
  fontSize: '1.5rem',
  textAlign: 'center',
  marginBottom: '0.75rem',
  fontFamily: 'Parisienne, cursive',
  color: '#1e3a8a',
};

export const uploadButtonStyle = {
  padding: '0.75rem 1.25rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  color: '#1e3a8a',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

export const imageButton = (bg, color = '#1e3a8a') => ({
  marginTop: '0.5rem',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: bg,
  color: color,
  cursor: 'pointer',
});

export const controlButton = {
  margin: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#f9f9f9',
  color: '#1e3a8a',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
};

export const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];