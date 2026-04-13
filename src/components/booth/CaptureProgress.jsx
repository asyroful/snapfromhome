import React from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

/**
 * CaptureProgress — Shows which photos have been taken
 *
 * Props:
 *  - total:        total number of photos (3)
 *  - captured:     how many have been captured
 *  - current:      which photo is being captured now (1-indexed)
 *  - isCountdown:  is a countdown running
 */
export default function CaptureProgress({ total = 3, captured = 0, current = 1, isCountdown = false }) {
  return (
    <div className="flex items-center gap-3 py-3">
      {Array.from({ length: total }, (_, i) => {
        const done    = i < captured
        const active  = i === captured && isCountdown

        return (
          <div key={i} className="flex items-center gap-3">
            <div className={`
              flex items-center justify-center rounded-full transition-all duration-300
              ${done   ? 'w-8 h-8 bg-booth-pink/20 text-booth-pink' : ''}
              ${active ? 'w-9 h-9 bg-booth-pink/30 text-booth-pink ring-2 ring-booth-pink/60 ring-offset-1 ring-offset-booth-bg animate-pulse' : ''}
              ${!done && !active ? 'w-8 h-8 border-2 border-booth-dim/40 text-booth-dim' : ''}
            `}>
              {done ? (
                <CheckCircle2 size={20} />
              ) : (
                <span className="text-sm font-bold font-display">{i + 1}</span>
              )}
            </div>

            {/* Connector line */}
            {i < total - 1 && (
              <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
                done ? 'bg-booth-pink' : 'bg-booth-dim/30'
              }`} />
            )}
          </div>
        )
      })}

      {/* Status text */}
      <span className="ml-2 text-xs text-booth-muted">
        {captured === total
          ? '✓ All photos taken'
          : isCountdown
            ? `Taking photo ${current}…`
            : `${captured}/${total} taken`}
      </span>
    </div>
  )
}
