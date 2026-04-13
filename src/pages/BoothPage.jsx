import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Home, RotateCcw, ChevronRight } from 'lucide-react'
import { useCamera }        from '../hooks/useCamera'
import { useShutterSound }  from '../hooks/useShutterSound'
import { useAnalytics }     from '../hooks/useAnalytics'
import CameraView           from '../components/booth/CameraView'
import CountdownOverlay     from '../components/booth/CountdownOverlay'
import FlashEffect          from '../components/booth/FlashEffect'
import CaptureProgress      from '../components/booth/CaptureProgress'
import CameraFallback       from '../components/booth/CameraFallback'
import Button               from '../components/ui/Button'
import useBoothStore        from '../stores/boothStore'
import useAdminStore        from '../stores/adminStore'
import { captureVideoFrame } from '../lib/canvas'

const TOTAL_PHOTOS   = 3

export default function BoothPage() {
  const navigate = useNavigate()

  // Store
  const selectedFrame      = useBoothStore((s) => s.selectedFrame)
  const addPhoto           = useBoothStore((s) => s.addPhoto)
  const updatePhoto        = useBoothStore((s) => s.updatePhoto)
  const photos             = useBoothStore((s) => s.photos)
  const clearPhotos        = useBoothStore((s) => s.clearPhotos)
  const captureState       = useBoothStore((s) => s.captureState)
  const setCaptureState    = useBoothStore((s) => s.setCaptureState)
  const currentPhotoIndex  = useBoothStore((s) => s.currentPhotoIndex)
  const setCurrentPhotoIndex = useBoothStore((s) => s.setCurrentPhotoIndex)

  // Redirect if no frame selected
  useEffect(() => {
    if (!selectedFrame) navigate('/')
  }, [selectedFrame, navigate])

  // Camera
  const {
    videoRef, isLoading, error, isAvailable,
    startCamera, stopCamera, facingMode, switchFacing,
  } = useCamera()

  // Audio
  const { playShutter, playCountdownBeep } = useShutterSound()

  // Analytics
  const { trackPhotoCaptured } = useAnalytics()

  const defaultCountdown = useAdminStore((s) => s.siteSettings?.defaultCountdown) || 5

  // Local state
  const [countdown,  setCountdown]  = useState(defaultCountdown)
  const [showFlash,  setShowFlash]  = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const timerRef     = useRef(null)
  const captureRef   = useRef(false)   // prevent double-capture

  // Start camera on mount
  useEffect(() => {
    startCamera()
    return () => { stopCamera(); clearTimer() }
  }, [])

  // Update state when all photos done
  useEffect(() => {
    if (photos.length === TOTAL_PHOTOS && captureState !== 'done') {
      setCaptureState('done')
    }
  }, [photos.length, captureState, setCaptureState])

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  /**
   * Start the countdown → capture sequence for one photo
   */
  const startSingleCapture = useCallback((photoIndex, isRetake = false) => {
    return new Promise((resolve) => {
      if (captureRef.current) return resolve()
      captureRef.current = true

      setCurrentPhotoIndex(photoIndex)
      setCaptureState('countdown')
      setCountdown(defaultCountdown)
      setIsCapturing(true)

      let remaining = defaultCountdown

      timerRef.current = setInterval(async () => {
        remaining -= 1
        setCountdown(remaining)

        // Beep on last 3 seconds
        if (remaining <= 3 && remaining > 0) {
          playCountdownBeep(remaining === 1 ? 1320 : 880)
        }

        if (remaining <= 0) {
          clearTimer()
          setCountdown(0)

          // Flash + shutter sound
          setShowFlash(true)
          playShutter()
          setTimeout(() => setShowFlash(false), 500)

          // Capture from video
          try {
            const dataUrl = await captureVideoFrame(videoRef.current)
            if (isRetake) {
              updatePhoto(photoIndex, dataUrl)
            } else {
              addPhoto(dataUrl)
            }
            trackPhotoCaptured(photoIndex + 1)
          } catch (e) {
            console.error('Capture error:', e)
          }

          setCaptureState('idle')
          setIsCapturing(false)
          captureRef.current = false
          resolve()
        }
      }, 750)
    })
  }, [addPhoto, updatePhoto, playShutter, playCountdownBeep, setCaptureState, setCurrentPhotoIndex, trackPhotoCaptured, videoRef, defaultCountdown])

  /**
   * Main "Start" button — kicks off automatic capture of all 3 photos
   */
  const handleStartAll = useCallback(async () => {
    if (!isAvailable) return
    clearPhotos()
    setCurrentPhotoIndex(0)

    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      await startSingleCapture(i)
      
      // Wait a beat between photos to allow users to transition poses
      if (i < TOTAL_PHOTOS - 1) {
        await sleep(2000)
      }
    }
  }, [isAvailable, clearPhotos, setCurrentPhotoIndex, startSingleCapture])

  const handleRetake = () => {
    clearTimer()
    clearPhotos()
    setCurrentPhotoIndex(0)
    setCaptureState('idle')
    setIsCapturing(false)
    captureRef.current = false
    startCamera()
  }

  const isCountdownActive = captureState === 'countdown'
  const canStart          = isAvailable && !isCapturing && photos.length < TOTAL_PHOTOS

  return (
    <div className="min-h-screen flex flex-col bg-booth-bg">
      <div className="animated-bg" />

      {/* ── TOPBAR ─────────────────────────────── */}
      <header className="relative flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <button
          onClick={() => { clearTimer(); stopCamera(); navigate('/') }}
          className="btn-ghost text-sm gap-1.5"
          aria-label="Back to home"
        >
          <Home size={16} /> Home
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-booth flex items-center justify-center">
            <Camera size={12} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm gradient-text">snapfromhome</span>
        </div>

        <button
          onClick={handleRetake}
          className="btn-ghost text-sm gap-1.5"
          disabled={isCapturing}
          aria-label="Retake photos"
        >
          <RotateCcw size={16} /> Retake
        </button>
      </header>

      {/* ── MAIN ──────────────────────────────── */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6 flex flex-col gap-5 page-enter">

        {/* Frame info */}
        {selectedFrame && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-booth-muted">Frame:</span>
            <span className="font-semibold text-booth-text">{selectedFrame.name}</span>
            <span className={selectedFrame.premium ? 'badge-premium' : 'badge-free'}>
              {selectedFrame.premium ? '✨ Premium' : 'Free'}
            </span>
          </div>
        )}

        {/* Camera view */}
        {error ? (
          <div className="glass-card">
            <CameraFallback error={error} onRetry={startCamera} />
          </div>
        ) : (
          <CameraView
            videoRef={videoRef}
            isLoading={isLoading}
            isAvailable={isAvailable}
            facingMode={facingMode}
            onSwitchFacing={switchFacing}
            onStartCamera={startCamera}
            overlayActive={isCountdownActive}
          >
            <CountdownOverlay
              active={isCountdownActive}
              seconds={countdown}
              photoNum={currentPhotoIndex + 1}
              totalPhotos={TOTAL_PHOTOS}
            />
          </CameraView>
        )}

        {/* Capture progress */}
        <CaptureProgress
          total={TOTAL_PHOTOS}
          captured={photos.length}
          current={currentPhotoIndex + 1}
          isCountdown={isCountdownActive}
        />

        {/* Thumbnail strip of taken photos */}
        {photos.length > 0 && (
          <div className="flex gap-2 animate-fade-in">
            {photos.map((url, i) => {
              const isActiveRetake = isCapturing && currentPhotoIndex === i;
              return (
              <div 
                key={i} 
                className={`relative flex-1 aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                  isActiveRetake ? 'ring-2 ring-booth-pink scale-105 ring-offset-2 ring-offset-booth-bg' : 'ring-1 ring-white/10 group cursor-pointer hover:ring-white/30'
                }`}
                onClick={() => !isCapturing && startSingleCapture(i, true)}
                title={isActiveRetake ? 'Retaking...' : 'Click to retake this photo'}
              >
                <img src={url} alt={`Photo ${i + 1}`} className={`w-full h-full object-cover transition-transform ${isActiveRetake ? 'opacity-30' : 'group-hover:scale-105'}`} />
                
                {isActiveRetake ? (
                  <div className="absolute inset-0 bg-booth-pink/20 flex flex-col items-center justify-center backdrop-blur-sm animate-pulse">
                    <span className="text-3xl font-bold font-display text-white drop-shadow-md">{countdown}</span>
                    <span className="text-[10px] text-white/90 font-medium uppercase tracking-wider mt-1">Retaking</span>
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center backdrop-blur-[1px] ${isCapturing ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-black/60 px-2.5 py-1.5 rounded-md">
                      <RotateCcw size={12} /> Retake
                    </span>
                  </div>
                )}
              </div>
              );
            })}
            {Array.from({ length: TOTAL_PHOTOS - photos.length }, (_, i) => (
              <div key={`empty-${i}`} className="flex-1 aspect-square rounded-lg bg-booth-card border border-dashed border-white/10 flex items-center justify-center">
                <Camera size={14} className="text-booth-dim" />
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {canStart && (
            <Button
              id="capture-start-btn"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStartAll}
              leftIcon={<Camera size={18} />}
            >
              {photos.length === 0 ? 'Start Capture (3 photos)' : `Continue (${TOTAL_PHOTOS - photos.length} left)`}
            </Button>
          )}

          {photos.length === TOTAL_PHOTOS && !isCapturing && (
            <Button
              id="generate-strip-btn"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                stopCamera()
                navigate('/preview')
              }}
              rightIcon={<ChevronRight size={18} />}
            >
              Generate Photostrip
            </Button>
          )}

          {isCapturing && (
            <div className="text-center text-booth-muted text-sm animate-pulse">
              Get ready… {defaultCountdown - countdown > 0 ? `(${countdown}s remaining)` : ''}
            </div>
          )}
        </div>
      </main>

      {/* Full-screen Flash Effect */}
      <FlashEffect active={showFlash} />
    </div>
  )
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}
