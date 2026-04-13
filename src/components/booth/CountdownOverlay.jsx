import React, { useEffect, useState, useRef } from 'react'
import { Camera } from 'lucide-react'

/**
 * CountdownOverlay — Animated countdown shown before capture
 *
 * Props:
 *  - active:      show or hide
 *  - seconds:     current countdown value
 *  - photoNum:    which photo (1/2/3)
 *  - totalPhotos: total (3)
 */
export default function CountdownOverlay({ active, seconds, photoNum = 1, totalPhotos = 3 }) {
  const [displayNum, setDisplayNum] = useState(seconds)
  const [animKey, setAnimKey]     = useState(0)

  useEffect(() => {
    if (active) {
      setDisplayNum(seconds)
      setAnimKey((k) => k + 1)
    }
  }, [active, seconds])

  if (!active) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] z-20">
      {/* Photo counter */}
      <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2 font-sans">
        Photo {photoNum} of {totalPhotos}
      </p>

      {/* Big countdown number */}
      <div
        key={animKey}
        className="countdown-number animate-countdown select-none"
        aria-live="polite"
        aria-label={`Capturing in ${seconds}`}
      >
        {seconds}
      </div>

      {/* Pulse ring */}
      <div className="relative mt-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-booth-pink/40 animate-pulse-ring"
            style={{ animationDelay: `${i * 0.75}s` }}
          />
        ))}
        <div className="w-3 h-3 rounded-full bg-booth-pink" />
      </div>

      {/* Tip */}
      <p className="flex items-center gap-1.5 text-white/50 text-xs mt-6 font-sans">
        Smile! <Camera size={14} />
      </p>
    </div>
  )
}
