import React, { useEffect, useState } from 'react';
import { useCuration } from './YourCurationContext';
import { curateGallery1 } from './utils/curateGallery1';
import { loadBlob } from './utils/dbCache';

export default function CuratedGallery1({ setView }) {
  const {
    artistGallery = [],
    ratings = {},
    setCG1Selections
  } = useCuration();

  const [groups, setGroups] = useState({ strong: [], medium: [], weak: [] });
  const [hydrated, setHydrated] = useState([]);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const result = curateGallery1({ artistGallery, ratings });
      setGroups({
        strong: result.strong || [],
        medium: result.medium || [],
        weak: result.weak || [],
      });

      const all = [...(result.strong || []), ...(result.medium || []), ...(result.weak || [])];

      async function hydrate() {
        const hydrated = await Promise.all(
          all.map(async (img) => {
            try {
              const blob = await loadBlob(img.localRefId);
              const url = URL.createObjectURL(blob);
              return {
                id: img.id,
                name: img.name,
                url,
              };
            } catch {
              return { id: img.id, name: img.name, url: '' };
            }
          })
        );
        setHydrated(hydrated);
      }

      hydrate();
    } catch (err) {
      setError(err.message || 'CG1 failed to process.');
    }
  }, [artistGallery, ratings]);

  const approveImage = (id) => {
    setSelections((prev) => ({ ...prev, [id]: 2 }));
  };

  const renderGroup = (label, group) => {
    const tierImages = hydrated.filter((img) =>
      group.find((g) => g.id === img.id)
    );

    if (tierImages.length === 0) return null;

    return (
      <>
        <h3 style={{ marginTop: '2rem', fontSize: '1.25rem', color: '#1e3a8a' }}>{label}</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
          }}
        >
          {tierImages.map((img) => {
            const isSelected = selections[img.id] === 2;

            return (
              <div key={img.id} style={{ textAlign: 'center' }}>
                <img
                  src={img.url}
                  alt={img.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                />
                <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{img.name}</p>
                <button
                  onClick={() => approveImage(img.id)}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1.25rem',
                    fontFamily: 'Parisienne, cursive',
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ccc',
                    backgroundColor: isSelected ? '#86efac' : '#d1fae5',
                    boxShadow: isSelected ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    color: '#065f46',
                    cursor: 'pointer',
                  }}
                >
                  More Like This
                </button>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        ❌ CG1 Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Parisienne, cursive', color: '#1e3a8a' }}>
        Curated Gallery Preview
      </h2>

      {renderGroup('✅ Strong Matches', groups.strong)}
      {renderGroup('🤔 Medium Matches', groups.medium)}
      {renderGroup('🧠 Weak Matches', groups.weak)}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => {
            setCG1Selections(selections); // ✅ Save before proceeding
            setView('curated2');
          }}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            backgroundColor: '#1e3a8a',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ➕ Show Me More Like These
        </button>
      </div>
    </div>
  );
}