import { useCallback, useEffect, useRef } from 'react'

/**
 * useShutterSound — plays a shutter click using Web Audio API
 * No external file needed; synthesized sound.
 */
export function useShutterSound() {
  const audioCtxRef = useRef(null)

  const getContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const playShutter = useCallback(() => {
    try {
      const ctx    = getContext()
      const now    = ctx.currentTime

      // Mechanical click — short burst of white noise
      const bufSize = ctx.sampleRate * 0.08
      const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data    = buffer.getChannelData(0)
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      // High-pass filter (clicky feel)
      const filter = ctx.createBiquadFilter()
      filter.type      = 'bandpass'
      filter.frequency.value = 1800
      filter.Q.value   = 1.2

      // Volume envelope
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.7, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start(now)
      source.stop(now + 0.1)
    } catch (e) {
      console.warn('Shutter sound failed:', e)
    }
  }, [getContext])

  const playCountdownBeep = useCallback((pitch = 880) => {
    try {
      const ctx = getContext()
      const now = ctx.currentTime

      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type            = 'sine'
      osc.frequency.value = pitch
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.15)
    } catch { /* ignore */ }
  }, [getContext])

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close()
    }
  }, [])

  return { playShutter, playCountdownBeep }
}
