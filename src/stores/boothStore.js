import { create } from 'zustand'

/**
 * BoothStore — global state for the photobooth capture flow
 */
const useBoothStore = create((set, get) => ({
  // ── Selected frame ──────────────────────────────
  selectedFrame: null,
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  // ── Captured photos (array of dataURL strings) ──
  photos: [],
  addPhoto: (dataUrl) => set((state) => ({
    photos: [...state.photos, dataUrl]
  })),
  updatePhoto: (index, dataUrl) => set((state) => {
    const newPhotos = [...state.photos]
    newPhotos[index] = dataUrl
    return { photos: newPhotos }
  }),
  clearPhotos: () => set({ photos: [] }),

  // ── Capture flow state ───────────────────────────
  // Possible states: 'idle' | 'countdown' | 'capturing' | 'preview' | 'done'
  captureState: 'idle',
  setCaptureState: (s) => set({ captureState: s }),

  currentPhotoIndex: 0,
  setCurrentPhotoIndex: (i) => set({ currentPhotoIndex: i }),

  countdownValue: 7,
  setCountdownValue: (v) => set({ countdownValue: v }),

  // ── Generated strips ────────────────────────────
  singleStripDataUrl: null,
  setSingleStripDataUrl: (url) => set({ singleStripDataUrl: url }),

  printLayoutDataUrl: null,
  setPrintLayoutDataUrl: (url) => set({ printLayoutDataUrl: url }),

  // ── Upload state ────────────────────────────────
  uploadedUrl: null,
  setUploadedUrl: (url) => set({ uploadedUrl: url }),

  isUploading: false,
  setIsUploading: (v) => set({ isUploading: v }),

  // ── Reset everything ────────────────────────────
  resetBooth: () => set({
    photos: [],
    captureState: 'idle',
    currentPhotoIndex: 0,
    countdownValue: 7,
    singleStripDataUrl: null,
    printLayoutDataUrl: null,
    uploadedUrl: null,
    isUploading: false,
  }),
}))

export default useBoothStore
