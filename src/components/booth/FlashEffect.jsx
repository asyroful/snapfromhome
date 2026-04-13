import React from 'react'

/**
 * FlashEffect — Full-screen white flash on capture
 * Triggered by the `active` prop changing to true
 */
export default function FlashEffect({ active }) {
  return (
    <div
      aria-hidden="true"
      className={`
        absolute inset-0 bg-white z-30 pointer-events-none
        ${active ? 'animate-flash' : 'opacity-0'}
      `}
    />
  )
}
