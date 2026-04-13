import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import framesConfig from '../config/frames.json'

/**
 * AdminStore — global state for the admin panel
 * Persisted to localStorage
 */
const useAdminStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────
      isAuthenticated: false,
      login: (username, password) => {
        const adminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
        if (username === adminUser && password === adminPass) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false }),

      // ── Frames ────────────────────────────────────
      frames: framesConfig,
      setFrames: (frames) => set({ frames }),

      updateFrame: (id, updates) => set((state) => ({
        frames: state.frames.map((f) => f.id === id ? { ...f, ...updates } : f)
      })),

      addFrame: (frame) => set((state) => ({
        frames: [...state.frames, frame]
      })),

      deleteFrame: (id) => set((state) => ({
        frames: state.frames.filter((f) => f.id !== id)
      })),

      reorderFrames: (fromIndex, toIndex) => set((state) => {
        const newFrames = [...state.frames]
        const [moved] = newFrames.splice(fromIndex, 1)
        newFrames.splice(toIndex, 0, moved)
        return { frames: newFrames }
      }),

      // ── Editing state ────────────────────────────
      editingFrameId: null,
      setEditingFrameId: (id) => set({ editingFrameId: id }),

      getEditingFrame: () => {
        const state = get()
        return state.frames.find((f) => f.id === state.editingFrameId) || null
      },

      // ── Global settings ───────────────────────────
      siteSettings: {
        siteName: 'SnapFromHome',
        tagline: 'Your personal photobooth',
        showPoweredBy: true,
        defaultCountdown: 5,
        maxUploadsPerDay: 5,
        cloudinaryCloudName: '',
      },
      updateSiteSettings: (updates) => set((state) => ({
        siteSettings: { ...state.siteSettings, ...updates }
      })),
    }),
    {
      name: 'snapfromhome-admin',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        frames: state.frames,
        siteSettings: state.siteSettings,
      }),
    }
  )
)

export default useAdminStore
