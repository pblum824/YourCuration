// File: src/GalleryGrid.jsx
import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { imageButton } from './utils/styles';
import EditableTagSection from './EditableTagSection';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';

const CELL_WIDTH = 300;
const CELL_HEIGHT = 530;
const GRID_PADDING = 16;

export default function GalleryGrid({
  images,
  onToggleScrape,
  onRemove,
  onToggleGallery,
  onToggleSample,
  devMode,
  sampleWarningId,
  onUpdateTag,
  showTags,
}) {
  const { selectedFont } = useFontSettings();
  const columnCount = Math.floor(window.innerWidth / (CELL_WIDTH + GRID_PADDING));
  const rowCount = Math.ceil(images.length / columnCount);
  const width = window.innerWidth;
  const height = window.innerHeight * 0.7;

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= images.length) return null;
    const img = images[index];

    return (
      <div style={{ ...style, padding: '0.5rem' }}>
        <div
          style={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            position: 'relative',
            margin: 'auto',
          }}
        >
          <img
            src={img.url}
            alt={img.name}
            style={{
              height: '200px',
              width: '100%',
              objectFit: 'contain',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          />

          <p
            title={img.name}
            style={{
              fontStyle: 'italic',
              ...getFontStyle('artist', { selectedFont }),
              marginTop: '0.25rem',
            }}
          >
            {img.name.length > 18 ? img.name.slice(0, 15) + '…' : img.name}
          </p>
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.15rem',
              marginTop: '0.15rem',
            }}
          >
            <button
              onClick={() => onToggleScrape?.(img.id)}
              style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
            >
              {img.scrapeEligible ? 'Accepted' : 'Excluded'}
            </button>
            <button
              onClick={() => onRemove?.(img.id)}
              style={imageButton('#fee2e2', '#991b1b')}
            >
              Remove
            </button>
            <button
              onClick={() => onToggleGallery?.(img.id)}
              style={imageButton(img.galleryEligible ? '#dbeafe' : '#f3f4f6')}
            >
              Gallery
            </button>
            <button
              onClick={() => onToggleSample?.(img.id)}
              style={imageButton(img.sampleEligible ? '#fef9c3' : '#f3f4f6')}
            >
              Sample
            </button>
          </div>

          {sampleWarningId === img.id && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                zIndex: 999,
                fontSize: '0.85rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #facc15',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              To make SampleRater quick and easy for your clients,<br />
              we recommend selecting no more than 15 samples.
            </div>
          )}

              {showTags && (
                <div
                  style={{
                    fontSize: '0.85rem',
                    marginTop: '0.5rem',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    width: '100%',
                    padding: '0.5rem',
                    minHeight: '5rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '0.25rem',
                  }}
                >
              {img.metadata?.imageTags?.length > 0 && (
                <div>
                  <strong>[image]</strong> {img.metadata.imageTags.join(', ')}
                </div>
              )}
              {img.metadata?.textTags?.length > 0 && (
                <div>
                  <strong>[text]</strong> {img.metadata.textTags.join(', ')}
                </div>
              )}
              {img.metadata?.toneTags?.length > 0 && (
                <div>
                  <strong>[tone]</strong> {img.metadata.toneTags.join(', ')}
                </div>
              )}
              {img.metadata?.moodTags?.length > 0 && (
                <div>
                  <strong>[mood]</strong> {img.metadata.moodTags.join(', ')}
                </div>
              )}
              {img.metadata?.paletteTags?.length > 0 && (
                <div>
                  <strong>[palette]</strong> {img.metadata.paletteTags.join(', ')}
                </div>
              )}
              {img.metadata?.customTags?.length > 0 && (
                <div>
                  <strong>[custom]</strong> {img.metadata.customTags.join(', ')}
                </div>
              )}
              {img.metadata?.error && (
                <div style={{ color: 'red', fontSize: '0.8rem' }}>
                  <strong>Error:</strong> {img.metadata.error}
                </div>
              )}
              <EditableTagSection image={img} onUpdateTag={onUpdateTag} />
            </div>
          )}

          {devMode && (
            <pre
              style={{
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                textAlign: 'left',
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(img.metadata, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        overflow: 'auto',
        maxWidth: '100vw',
        margin: '0 auto',
      }}
    >
      <Grid
        columnCount={columnCount}
        columnWidth={CELL_WIDTH}
        height={height}
        rowCount={rowCount}
        rowHeight={CELL_HEIGHT}
        width={width}
      >
        {Cell}
      </Grid>
    </div>
  );
}