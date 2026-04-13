import React from 'react'
import { Camera, WifiOff } from 'lucide-react'

/**
 * CameraFallback — Shown when camera is not available
 *
 * Props:
 *  - error:     string describing the error
 *  - onRetry:  callback to retry camera access
 */
export default function CameraFallback({ error, onRetry }) {
  const isPermission = error?.toLowerCase().includes('permission') ||
                       error?.toLowerCase().includes('denied')
  const isNotFound   = error?.toLowerCase().includes('no camera') ||
                       error?.toLowerCase().includes('not found')

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 gap-6 min-h-[300px]">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        {isNotFound ? (
          <WifiOff size={32} className="text-red-400" />
        ) : (
          <Camera size={32} className="text-red-400" />
        )}
      </div>

      {/* Message */}
      <div className="max-w-xs">
        <h3 className="text-lg font-semibold text-booth-text mb-2">
          {isPermission ? 'Camera Access Denied'
           : isNotFound  ? 'No Camera Found'
           : 'Camera Unavailable'}
        </h3>
        <p className="text-booth-muted text-sm leading-relaxed">
          {error || 'Unable to access your camera.'}
        </p>
      </div>

      {/* Instructions */}
      {isPermission && (
        <div className="glass-card p-4 text-left text-sm text-booth-muted max-w-xs w-full">
          <p className="font-medium text-booth-text mb-2">How to allow:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the camera icon in your browser's address bar</li>
            <li>Select <strong className="text-booth-text">Allow</strong> for camera</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      )}

      {!isNotFound && (
        <button
          onClick={onRetry}
          className="btn-secondary text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
