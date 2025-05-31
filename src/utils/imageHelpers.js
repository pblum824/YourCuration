// File: utils/imageHelpers.js

export const compressImage = async (file, maxWidth = 1600) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            resolve(
              new File([blob], file.name, { type: file.type, lastModified: Date.now() })
            ),
          file.type,
          0.75
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

export const fileToBase64 = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

export const imageToBase64 = (url) =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject('Failed to read image blob');
          reader.readAsDataURL(blob);
        })
    );

export const toUrl = async (data, name, meta, scrape = true, gallery = true, sample = false) => {
  const byteString = atob(data.split(',')[1]);
  const mime = data.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: mime });
  const file = new File([blob], name, { type: mime, lastModified: Date.now() });
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    url: URL.createObjectURL(blob),
    file,
    base64: data,
    scrapeEligible: scrape,
    galleryEligible: gallery,
    sampleEligible: sample,
    metadata: meta || {},
  };
};