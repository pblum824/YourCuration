// File: src/utils/zipStore.js

import JSZip from 'jszip';

let zip = new JSZip();
const zipIndex = new Map(); // id => path
let loaded = false;

export async function cacheImageToZip(id, blob) {
  const path = `images/${id}`;
  zip.file(path, blob);
  zipIndex.set(id, path);
}

export async function loadImageFromZip(id) {
  const path = zipIndex.get(id);
  if (!path) throw new Error(`Image ${id} not found in zip`);
  const file = zip.file(path);
  if (!file) throw new Error(`Zip file missing entry for ${id}`);
  return await file.async('blob');
}

export async function deleteImageFromZip(id) {
  const path = zipIndex.get(id);
  if (path) {
    zip.remove(path);
    zipIndex.delete(id);
  }
}

export async function listZipKeys() {
  return Array.from(zipIndex.keys());
}

export async function exportZipBundle({ heroImage, borderSkin, centerBackground, artistGallery, selectedFont }) {
  const metadata = {
    strategy: 'zip',
    timestamp: new Date().toISOString(),
    selectedFont: selectedFont || 'system-ui',
    heroImage: heroImage?.id || null,
    borderSkin: borderSkin?.id || null,
    centerBackground: centerBackground?.id || null,
    images: artistGallery.map((img) => ({
      id: img.id,
      name: img.name,
      scrapeEligible: img.scrapeEligible,
      galleryEligible: img.galleryEligible,
      sampleEligible: img.sampleEligible,
      metadata: img.metadata || {},
    })),
  };

  zip.file('meta.json', JSON.stringify(metadata, null, 2));
  return await zip.generateAsync({ type: 'blob' });
}

export async function importZipBundle(file) {
  zip = await JSZip.loadAsync(file);
  loaded = true;

  const metaFile = zip.file('meta.json');
  if (!metaFile) throw new Error('Missing metadata in zip');
  const meta = JSON.parse(await metaFile.async('string'));

  Object.keys(zip.files).forEach((path) => {
    if (path.startsWith('images/')) {
      const id = path.split('/')[1];
      zipIndex.set(id, path);
    }
  });

  const hydrate = async (id) => {
    const metaImg = meta.images.find((x) => x.id === id);
    const blob = await loadImageFromZip(id);
    return {
      id,
      name: metaImg?.name || id,
      url: URL.createObjectURL(blob),
      scrapeEligible: metaImg?.scrapeEligible,
      galleryEligible: metaImg?.galleryEligible,
      sampleEligible: metaImg?.sampleEligible,
      metadata: metaImg?.metadata || {},
      localRefId: id,
    };
  };

  const images = await Promise.all(meta.images.map((img) => hydrate(img.id)));

  return {
    heroImage: meta.heroImage ? await hydrate(meta.heroImage) : null,
    borderSkin: meta.borderSkin ? await hydrate(meta.borderSkin) : null,
    centerBackground: meta.centerBackground ? await hydrate(meta.centerBackground) : null,
    images,
    strategy: 'zip',
    selectedFont: meta.selectedFont || 'system-ui',
  };
}