const STORAGE_KEYS = {
  ARTIST_SAMPLES: 'artistSamples',
  ARTIST_GALLERY: 'artistGallery',
  RATINGS: 'ratings',
};

const storageService = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage`, error);
      return [];
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage`, error);
    }
  },

  clear(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage`, error);
    }
  },

  // Specific wrappers
  getArtistSamples() {
    return this.get(STORAGE_KEYS.ARTIST_SAMPLES);
  },
  setArtistSamples(data) {
    this.set(STORAGE_KEYS.ARTIST_SAMPLES, data);
  },

  getArtistGallery() {
    return this.get(STORAGE_KEYS.ARTIST_GALLERY);
  },
  setArtistGallery(data) {
    this.set(STORAGE_KEYS.ARTIST_GALLERY, data);
  },

  getRatings() {
    return this.get(STORAGE_KEYS.RATINGS);
  },
  setRatings(data) {
    this.set(STORAGE_KEYS.RATINGS, data);
  },
};

export default storageService;