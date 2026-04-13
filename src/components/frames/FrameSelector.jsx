import React from 'react'
import { Lock, Sparkles, Check } from 'lucide-react'
import useAdminStore from '../../stores/adminStore'

/**
 * FrameSelector — Grid of available frame templates
 *
 * Props:
 *  - selectedId:  currently selected frame id
 *  - onSelect:    (frame) => void
 */
export default function FrameSelector({ selectedId, onSelect }) {
  const frames       = useAdminStore((s) => s.frames)
  const isAuth       = useAdminStore((s) => s.isAuthenticated)

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar px-1">
      {frames.map((frame) => {
        const isLocked   = frame.premium && !isAuth
        const isSelected = selectedId === frame.id

        return (
          <button
            key={frame.id}
            id={`frame-${frame.id}`}
            onClick={() => !isLocked && onSelect(frame)}
            disabled={isLocked}
            className={`
              relative group flex flex-col rounded-xl overflow-hidden text-left transition-all duration-300
              flex-shrink-0 snap-start w-36 sm:w-40 md:w-44
              ${isSelected
                ? 'ring-2 ring-booth-pink ring-offset-2 ring-offset-booth-bg'
                : 'hover:-translate-y-1 hover:ring-2 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-booth-bg'}
              ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`${isLocked ? '[Premium] ' : ''}${frame.name} template`}
            aria-pressed={isSelected}
          >
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-booth-card relative overflow-hidden">
              <FrameThumbnail frame={frame} />

              {/* Lock overlay */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                  <Lock size={20} className="text-booth-gold" />
                </div>
              )}

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-booth-pink flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}

              {/* Category badge */}
              <div className="absolute top-2 left-2">
                {frame.premium ? (
                  <span className="badge-premium text-[10px]">
                    <Sparkles size={9} /> Pro
                  </span>
                ) : (
                  <span className="badge-free text-[10px]">Free</span>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="px-2 py-1.5 bg-booth-card">
              <p className="text-xs font-semibold text-booth-text truncate">
                {frame.name}
              </p>
              <p className="text-[10px] text-booth-dim truncate mt-0.5">
                {frame.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * FrameThumbnail — Visual representation of a frame config
 */
function FrameThumbnail({ frame }) {
  const { canvas, footer } = frame
  const bg = canvas?.backgroundColor || '#fff'

  // Determine strip style from frame id
  const isDark    = bg === '#0f0f0f' || bg === '#000' || bg.startsWith('#0')
  const textColor = footer?.color || (isDark ? '#FF6B9D' : '#999')
  const accentColor =
    frame.id === 'cute'     ? '#FF6B9D' :
    frame.id === 'wedding'  ? '#D4AF37' :
    frame.id === 'birthday' ? '#E84393' :
    isDark                  ? '#FF6B9D' : '#cccccc'

  return (
    <div
      className="w-full h-full flex flex-col p-2 gap-1.5"
      style={{ backgroundColor: bg }}
    >
      {/* 3 photo slots */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex-1 rounded-sm opacity-40"
          style={{ backgroundColor: accentColor }}
        />
      ))}
      {/* Footer */}
      {footer?.show && (
        <div className="h-3 flex items-center justify-center">
          <div
            className="h-1 rounded-full w-2/3 opacity-60"
            style={{ backgroundColor: textColor }}
          />
        </div>
      )}
    </div>
  )
}
