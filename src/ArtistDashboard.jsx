import { analyzeImageFromURL } from './utils/analyzeVisualMetadata';
import React, { useState, useEffect, useRef } from 'react';
import AppReadyState from './AppReadyState';
import * as ort from 'onnxruntime-web';
import { preprocessImage } from './utils/imageProcessing';
import { getTextFeatures } from './utils/clipText';

const TAG_PROMPTS = [
  // People & Figures
  'person', 'woman', 'man', 'child', 'elderly person', 'couple', 'group of people', 'portrait', 'self-portrait',
  'mother and child', 'silhouette', 'dancer', 'musician', 'hands', 'face', 'eyes', 'profile', 'back view',

  // Animals
  'dog', 'cat', 'horse', 'cow', 'zebra', 'elephant', 'bird', 'hawk', 'eagle', 'owl',
  'rabbit', 'fox', 'deer', 'wolf', 'lion', 'tiger', 'bear', 'flamingo', 'fish', 'insect', 'bee', 'butterfly',

  // Nature & Landscapes
  'landscape', 'seascape', 'mountain', 'valley', 'forest', 'desert', 'snow', 'ice', 'sunset', 'sunrise',
  'storm', 'clouds', 'rain', 'mist', 'fog', 'ocean', 'river', 'lake', 'waterfall', 'field', 'tree', 'flower',
  'wildflower', 'cactus', 'leaf', 'moss', 'rock formation', 'coastline', 'cliff',

  // Settings & Architecture
  'interior', 'exterior', 'building', 'church', 'temple', 'ruin', 'archway', 'bridge', 'castle',
  'abandoned place', 'urban street', 'alley', 'corridor', 'window', 'door', 'stairs', 'balcony', 'courtyard',
  'market', 'train station', 'airport', 'road', 'path', 'tunnel',

  // Styles & Concepts
  'black and white', 'high contrast', 'minimalist', 'maximalist', 'surreal', 'dreamlike',
  'vintage', 'retro', 'documentary', 'editorial', 'fashion', 'candid', 'soft focus', 'motion blur', 'shallow depth of field',

  // Moods & Emotions
  'moody', 'serene', 'energetic', 'romantic', 'lonely', 'nostalgic', 'mysterious',
  'joyful', 'melancholy', 'introspective', 'spiritual', 'tense', 'playful', 'gritty', 'peaceful', 'eerie',

  // Light & Color
  'dramatic lighting', 'backlit', 'golden hour', 'blue hour', 'harsh light', 'soft light',
  'shadow play', 'reflections', 'lens flare', 'warm tones', 'cool tones', 'neutral tones',

  // Artistic & Abstract
  'abstract', 'geometric', 'patterned', 'texture', 'motion', 'repetition',
  'close-up', 'macro', 'bokeh', 'long exposure', 'double exposure',

  // Objects & Still Life
  'still life', 'book', 'clock', 'mirror', 'glass', 'vase', 'bottle', 'fruit', 'flower arrangement', 'chair',
  'musical instrument', 'camera', 'bicycle', 'car', 'train', 'airplane', 'boat', 'bridge',

  // Events & Scenes
  'celebration', 'protest', 'wedding', 'funeral', 'festival', 'ceremony', 'crowd', 'solitude',
  'travel', 'adventure', 'exploration', 'daily life', 'street photography', 'environmental portrait',

  // Composition
  'rule of thirds', 'leading lines', 'centered composition', 'symmetry', 'asymmetry', 'framing', 'negative space',
];

const ACTION_PROMPTS = [
  // Expressive actions & emotions
  'protesting', 'celebrating', 'waiting', 'marching', 'hugging', 'crying', 'smiling',
  'laughing', 'embracing', 'running', 'sitting', 'standing', 'kneeling', 'reaching',
  'pointing', 'gesturing', 'shouting', 'listening', 'watching', 'reading', 'writing',

  // Artistic or passive movement
  'posing', 'dancing', 'meditating', 'floating', 'jumping', 'stretching', 'sleeping', 'praying',

  // Human–environment interactions
  'working', 'cooking', 'serving', 'painting', 'cleaning', 'carrying', 'gardening',
  'shopping', 'traveling', 'commuting', 'observing',

  // Group/social dynamics
  'gathering', 'arguing', 'negotiating', 'collaborating', 'playing', 'teaching', 'learning',
  'competing', 'caring', 'nurturing', 'protecting',

  // Narrative verbs
  'protesting', 'resisting', 'demanding', 'mourning', 'celebrating', 'reflecting',
  'struggling', 'enduring', 'believing', 'honoring'
];

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ArtistDashboard() {
  const [heroImage, setHeroImage] = useState(null);
  const [borderSkin, setBorderSkin] = useState(null);
  const [centerBackground, setCenterBackground] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadWarnings, setUploadWarnings] = useState([]);
  const sessionRef = useRef(null);
  const textFeaturesRef = useRef(null);
  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem('yourcuration_devMode') === 'true';
  });
  const [images, setImages] = useState(() => {
    const stored = localStorage.getItem('yourcuration_artistImages');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('yourcuration_artistImages', JSON.stringify(images));
  }, [images]);

  const loadCLIP = async () => {
    console.log('[YourCuration] FORCED: Attempting to load ONNX CLIP model...');

    try {
      const session = await ort.InferenceSession.create(
        'https://yourcuration-static.s3.us-east-2.amazonaws.com/models/clip-text-vit-b32.onnx'
      );
      
      console.log('[YourCuration] ONNX model loaded!');
      alert('[YourCuration] ONNX model loaded!');

      const allPrompts = [...TAG_PROMPTS, ...ACTION_PROMPTS];
      const features = await getTextFeatures(allPrompts, session);
      textFeaturesRef.current = features;
      console.log('[YourCuration] Text features ready.');

      sessionRef.current = session;
      textFeaturesRef.current = features;
    } catch (err) {
      console.error('[YourCuration] ONNX load failed:', err);
      alert('[YourCuration] ONNX model load failed. See console.');
    }
  };
  
  const cosineSimilarity = (a, b) => {
    let dot = 0, aMag = 0, bMag = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      aMag += a[i] ** 2;
      bMag += b[i] ** 2;
    }
    return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
  };

      const getCLIPTags = async (imageDataURL) => {
        console.log('[YourCuration] Running getCLIPTags() for image');
        try {
          await loadCLIP();

          const img = new Image();
          img.src = imageDataURL;
          await new Promise((res) => (img.onload = res));

          console.log('[YourCuration] Calling preprocessImage and running session');
          const tensor = await preprocessImage(img);
          const output = await sessionRef.current.run({ image: tensor });
          const imageFeatures = output['image_features'].data;

          const allScores = textFeaturesRef.current.map((feature, i) => ({
            tag: i < TAG_PROMPTS.length ? TAG_PROMPTS[i] : ACTION_PROMPTS[i - TAG_PROMPTS.length],
            type: i < TAG_PROMPTS.length ? 'subject' : 'action',
            score: cosineSimilarity(imageFeatures, feature),
          }));

          allScores.sort((a, b) => b.score - a.score);
          const topTags = allScores.slice(0, 7); // adjust as needed

          console.log('[YourCuration] Top tags:', topTags.map(t => t.tag));
          return topTags.map(s => s.tag);
        } catch (err) {
          console.warn('[YourCuration] CLIP tagging failed:', err);
          return ['clip-error'];
        }
      };
      

      const tensor = await preprocessImage(img);
      const output = await sessionRef.current.run({ image: tensor });
      const imageFeatures = output['image_features'].data;

      const allScores = textFeaturesRef.current.map((feature, i) => ({
        tag: i < TAG_PROMPTS.length ? TAG_PROMPTS[i] : ACTION_PROMPTS[i - TAG_PROMPTS.length],
        type: i < TAG_PROMPTS.length ? 'subject' : 'action',
        score: cosineSimilarity(imageFeatures, feature),
      }));

      allScores.sort((a, b) => b.score - a.score);
      const topTags = allScores.slice(0, 7);

      // ✅ THIS is the line you want:
      console.log('[CLIP] Final top tags:', topTags);

      return topTags.map(s => s.tag);
    } catch (err) {
      console.warn('[YourCuration] CLIP tagging failed:', err);
      return ['clip-error'];
    }
  };

  const compressImage = async (file, maxWidth = 1600) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            0.75
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const createImageObject = async (file) => {
    console.log('[YourCuration] Starting image processing for:', file.name);
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    const base64 = await imageToBase64(url);

    console.log('[YourCuration] Starting metadata generation from image');
    const [clipTags, visualData] = await Promise.all([
      getCLIPTags(base64),
      analyzeImageFromURL(base64)
    ]);

    const mergedTags = Array.from(new Set([...clipTags, ...visualData.tags]));

    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: file.name,
      url,
      scrapeEligible: true,
      metadata: {
        tags: mergedTags,
        dimensions: visualData.dimensions,
        dominantHue: visualData.dominantHue
      }
    };
  };

  const imageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch image blob');
          return res.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject('Failed to read image blob');
          reader.readAsDataURL(blob);
        })
        .catch((err) => {
          console.error('Error during image fetch:', err);
          reject(err);
        });
    });
  };

  const exportGallery = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const exportImage = async (img) => ({
        name: img.name,
        data: await imageToBase64(img.url),
        scrapeEligible: img.scrapeEligible,
        metadata: img.metadata,
      });

      const bundle = {
        timestamp,
        heroImage: heroImage ? await exportImage(heroImage) : null,
        borderSkin: borderSkin ? await exportImage(borderSkin) : null,
        centerBackground: centerBackground ? await exportImage(centerBackground) : null,
        images: await Promise.all(images.map(exportImage)),
      };

      const json = JSON.stringify(bundle, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `YourCuration-Gallery-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Export successful');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check the console for details.');
    }
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const newWarnings = [];

    const validFiles = files.filter((file) => {
      if (!file.type) {
        newWarnings.push(`${file.name || 'Unnamed file'} skipped: missing type.`);
        return false;
      }
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        newWarnings.push(`${file.name} skipped: unsupported file type.`);
        return false;
      }
      return true;
    });

    setUploadWarnings(newWarnings);
    setUploadCount(validFiles.length);

    const newImages = await Promise.all(validFiles.map(createImageObject));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleSingleUpload = async (e, setState) => {
    const file = e.target.files[0];
    if (!file) return;

    const warnings = [];
    if (!file.type || !ACCEPTED_FORMATS.includes(file.type)) {
      warnings.push(`${file.name} skipped: unsupported file type.`);
    }

    if (warnings.length > 0) {
      setUploadWarnings(warnings);
      return;
    }

    const imageObj = await createImageObject(file);
    setUploadWarnings([]);
    setState(imageObj);
  };

  const toggleScrape = (imageSetter) => {
    imageSetter((prev) => ({
      ...prev,
      scrapeEligible: !prev.scrapeEligible,
    }));
  };

  const toggleImageScrape = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scrapeEligible: !img.scrapeEligible } : img
      )
    );
  };
  const toggleDevMode = () => {
    const next = !devMode;
    setDevMode(next);
    localStorage.setItem('yourcuration_devMode', String(next));
  };
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const resetDashboard = () => {
    const confirmed = window.confirm('Are you sure you want to reset your entire dashboard? This will remove all uploads and settings.');
    if (!confirmed) return;

    localStorage.removeItem('yourcuration_artistImages');
    localStorage.removeItem('yourcuration_ready');
    localStorage.removeItem('yourcuration_readyBundle');

    setHeroImage(null);
    setBorderSkin(null);
    setCenterBackground(null);
    setImages([]);
    setUploadWarnings([]);
    setUploadCount(0);
  };
  const importGallery = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bundle = JSON.parse(reader.result);

        const dataURItoBlob = (dataURI) => {
          const byteString = atob(dataURI.split(',')[1]);
          const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ab], { type: mime });
        };

        const toUrl = (data, name, meta, flag) => {
          const blob = dataURItoBlob(data);
          return {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            name,
            url: URL.createObjectURL(blob),
            scrapeEligible: flag,
            metadata: meta,
          };
        };

        if (bundle.heroImage) {
          const { name, data, metadata, scrapeEligible } = bundle.heroImage;
          setHeroImage(toUrl(data, name, metadata, scrapeEligible));
        }

        if (bundle.borderSkin) {
          const { name, data, metadata, scrapeEligible } = bundle.borderSkin;
          setBorderSkin(toUrl(data, name, metadata, scrapeEligible));
        }

        if (bundle.centerBackground) {
          const { name, data, metadata, scrapeEligible } = bundle.centerBackground;
          setCenterBackground(toUrl(data, name, metadata, scrapeEligible));
        }

        if (bundle.images && Array.isArray(bundle.images)) {
          const gallery = bundle.images.map(img =>
            toUrl(img.data, img.name, img.metadata, img.scrapeEligible)
          );
          setImages(gallery);
        }

        alert('Gallery imported successfully!');
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import gallery. Please check your file.');
      }
    };

    reader.readAsText(file);
  };
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button onClick={toggleDevMode} style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          {devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
        </button>
      </div>
      <h2 style={heading}>Artist Dashboard</h2>

      {/* Presentation Mode + Export/Import/Reset Buttons */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <AppReadyState
          heroImage={heroImage}
          borderSkin={borderSkin}
          centerBackground={centerBackground}
          images={images}
          clientSessions={[]}
        />
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={exportGallery} style={controlButton}>
            Export YourCuration Gallery
          </button>
          <label style={{ ...controlButton, display: 'inline-block', cursor: 'pointer' }}>
            Import YourCuration Gallery
            <input
              type="file"
              accept=".json"
              onChange={importGallery}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={resetDashboard}
            style={{ ...controlButton, backgroundColor: '#fee2e2', color: '#b91c1c' }}
          >
            Reset Entire Dashboard
          </button>
        </div>
      </div>

      {/* Upload Sections */}
      {[['Hero Image', heroImage, setHeroImage, 'hero-upload'],
        ['Border Skin', borderSkin, setBorderSkin, 'border-upload'],
        ['Center Background', centerBackground, setCenterBackground, 'center-upload']
      ].map(([label, state, setter, inputId]) => (
        <div key={inputId} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={section}>Upload Your {label}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label htmlFor={inputId} style={uploadButtonStyle}>
              Choose File
              <input
                id={inputId}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleSingleUpload(e, setter)}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              {state?.name || 'No file selected'}
            </span>
          </div>
          {state?.url && (
            <>
              <img
                src={state.url}
                alt={state.name}
                style={{
                  maxWidth: '480px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
                }}
              />
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => toggleScrape(setter)}
                  style={imageButton(state.scrapeEligible ? '#d1fae5' : '#fee2e2')}
                >
                  {state.scrapeEligible ? 'Accepted' : 'Excluded'}
                </button>
                <button
                  onClick={() => setter(null)}
                  style={imageButton('#fef2f2', '#991b1b')}
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      ))}

        <h3 style={section}>Your Photo Library</h3>
        
      {/* Upload Warnings */}
      {uploadWarnings.length > 0 && (
        <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#b91c1c' }}>
          <p style={{ fontWeight: 600 }}>Some files were not added:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {uploadWarnings.map((warn, i) => (
              <li key={i} style={{ fontSize: '0.9rem' }}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Drag-and-Drop Zone */}
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: '2px dashed #aaa',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragging ? '#f0fdfa' : '#fff',
          cursor: 'pointer',
          marginBottom: '1.25rem',
          width: '80%',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>Drag and drop images here</p>
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          (JPEG, PNG, or WebP only)
        </p>
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#666' }}>
          YourCuration automatically optimizes uploaded images for preview. Use full-res outside this tool if needed.
        </p>
      </div>

      {/* File Picker */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <label htmlFor="multiUpload" style={uploadButtonStyle}>
          Choose Files
          <input
            id="multiUpload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
          {uploadCount === 0 ? 'No files selected' : `${uploadCount} file${uploadCount > 1 ? 's' : ''} selected`}
        </span>
      </div>

      {/* Image Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '300px', textAlign: 'center' }}>
            {img.url && (
              <img
                src={img.url}
                alt={img.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}
              />
            )}
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{img.name}</p>
            <button
              onClick={() => toggleImageScrape(img.id)}
              style={imageButton(img.scrapeEligible ? '#d1fae5' : '#fee2e2')}
            >
              {img.scrapeEligible ? 'Accepted' : 'Excluded'}
            </button>
            <button
              onClick={() => removeImage(img.id)}
              style={imageButton('#fef2f2', '#991b1b')}
            >
              Remove
            </button>
            {devMode && (
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
                <strong>Tags:</strong> {img.metadata?.tags?.join(', ') || 'n/a'}<br />
                <strong>Mood:</strong> {img.metadata?.dimensions?.mood?.join(', ') || 'n/a'}<br />
                <strong>Tone:</strong> {img.metadata?.dimensions?.visualTone?.join(', ') || 'n/a'}<br />
                <strong>Palette:</strong> {img.metadata?.dimensions?.colorPalette?.join(', ') || 'n/a'}<br />
                <strong>Hue:</strong> {img.metadata?.dominantHue ?? 'n/a'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles

const heading = {
  fontSize: '2.25rem',
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#1e3a8a',
  fontFamily: 'Parisienne, cursive',
};

const section = {
  fontSize: '1.5rem',
  textAlign: 'center',
  marginBottom: '0.75rem',
  fontFamily: 'Parisienne, cursive',
  color: '#1e3a8a',
};

const uploadButtonStyle = {
  padding: '0.75rem 1.25rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  color: '#1e3a8a',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const imageButton = (bg, color = '#1e3a8a') => ({
  marginTop: '0.5rem',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: bg,
  color: color,
  cursor: 'pointer',
});

const controlButton = {
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