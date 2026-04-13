import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useCamera — Manages getUserMedia camera stream
 *
 * Returns:
 *  - videoRef:      ref to attach to <video> element
 *  - stream:        active MediaStream | null
 *  - isLoading:     waiting for permission
 *  - error:         string | null
 *  - isAvailable:   camera is available & streaming
 *  - startCamera():  init/restart camera
 *  - stopCamera():   stop all tracks
 *  - switchFacing(): toggle front/rear on mobile
 */
export function useCamera() {
  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const [stream, setStream]       = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async (facing = facingMode) => {
    setIsLoading(true)
    setError(null)
    stopCamera()

    const constraints = {
      video: {
        facingMode: facing,
        width:  { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera error:', err)
      let msg = 'Camera access failed.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings.'
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on your device.'
      } else if (err.name === 'NotReadableError') {
        msg = 'Camera is already in use by another application.'
      } else if (err.name === 'OverconstrainedError') {
        // Retry without constraints
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          streamRef.current = fallback
          setStream(fallback)
          if (videoRef.current) {
            videoRef.current.srcObject = fallback
            await videoRef.current.play()
          }
          setIsLoading(false)
          return
        } catch {
          msg = 'Camera not compatible with your browser.'
        }
      }
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [facingMode, stopCamera])

  const switchFacing = useCallback(() => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    startCamera(newFacing)
  }, [facingMode, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const isAvailable = !!stream && !error && !isLoading

  return {
    videoRef,
    stream,
    isLoading,
    error,
    isAvailable,
    facingMode,
    startCamera,
    stopCamera,
    switchFacing,
  }
}
