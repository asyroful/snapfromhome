import React, { useEffect, useRef, forwardRef } from 'react'
import { Camera, RotateCcw } from 'lucide-react'

/**
 * CameraView — Live camera preview with mirror effect
 *
 * Props:
 *  - videoRef:     forwarded ref to <video>
 *  - isLoading:    show spinner
 *  - onStartCamera: callback to init camera
 *  - facingMode:   'user' | 'environment'
 *  - onSwitchFacing
 *  - overlayActive: dim the camera for countdown
 */
const CameraView = forwardRef(({
  videoRef,
  isLoading,
  isAvailable,
  onStartCamera,
  facingMode,
  onSwitchFacing,
  overlayActive = false,
  children,
}, _ref) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-booth-surface rounded-2xl overflow-hidden group">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`
          w-full h-full object-cover camera-mirror
          transition-opacity duration-300
          ${isAvailable ? 'opacity-100' : 'opacity-0'}
          ${overlayActive ? 'opacity-60' : ''}
        `}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-booth-surface">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-booth-pink border-t-transparent animate-spin" />
            <p className="text-booth-muted text-sm">Accessing camera…</p>
          </div>
        </div>
      )}

      {/* Not started yet */}
      {!isLoading && !isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-booth-surface">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-booth-pink/10 flex items-center justify-center">
              <Camera size={28} className="text-booth-pink" />
            </div>
            <div>
              <p className="text-booth-text font-medium">Camera preview</p>
              <p className="text-booth-muted text-sm mt-1">Click "Start" to activate your camera</p>
            </div>
          </div>
        </div>
      )}

      {/* Viewfinder corners (aesthetic) */}
      {isAvailable && (
        <>
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-sm pointer-events-none" />
        </>
      )}

      {/* Switch camera button (mobile) */}
      {isAvailable && onSwitchFacing && (
        <button
          onClick={onSwitchFacing}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white transition-all hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Switch camera"
          aria-label="Switch camera facing"
        >
          <RotateCcw size={18} />
        </button>
      )}

      {/* Slot for overlay content (countdown, flash) */}
      {children}
    </div>
  )
})

CameraView.displayName = 'CameraView'
export default CameraView
