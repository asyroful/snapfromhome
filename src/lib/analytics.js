/**
 * analytics.js — Google Analytics 4 event helpers
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

/**
 * Track a GA4 event
 * @param {string} eventName
 * @param {object} [params]
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  if (!window.gtag) return
  window.gtag('event', eventName, params)
}

export const GA_EVENTS = {
  CAMERA_STARTED:    'camera_started',
  PHOTO_CAPTURED:    'photo_captured',
  STRIP_GENERATED:   'strip_generated',
  DOWNLOAD_SINGLE:   'download_single',
  DOWNLOAD_PRINT:    'download_print',
  UPLOAD_CLOUD:      'upload_cloudinary',
  RETAKE:            'retake',
  FRAME_SELECTED:    'frame_selected',
  ADMIN_LOGIN:       'admin_login',
  SHARE:             'share',
}

/**
 * Inject gtag script dynamically if GA_ID is set
 */
export function initAnalytics() {
  if (!GA_ID || typeof document === 'undefined') return

  // Inject script tag
  const script = document.createElement('script')
  script.async = true
  script.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID)
}
