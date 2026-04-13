import { useCallback } from 'react'
import { trackEvent, GA_EVENTS } from '../lib/analytics'

/**
 * useAnalytics — wrapper around trackEvent for easy use in components
 */
export function useAnalytics() {
  const track = useCallback((eventName, params = {}) => {
    trackEvent(eventName, params)
  }, [])

  return {
    track,
    events: GA_EVENTS,
    trackCameraStart:    (params) => track(GA_EVENTS.CAMERA_STARTED, params),
    trackPhotoCaptured:  (index)  => track(GA_EVENTS.PHOTO_CAPTURED, { photo_index: index }),
    trackStripGenerated: (frame)  => track(GA_EVENTS.STRIP_GENERATED, { frame_id: frame }),
    trackDownloadSingle: ()       => track(GA_EVENTS.DOWNLOAD_SINGLE),
    trackDownloadPrint:  ()       => track(GA_EVENTS.DOWNLOAD_PRINT),
    trackRetake:         ()       => track(GA_EVENTS.RETAKE),
    trackFrameSelected:  (id)     => track(GA_EVENTS.FRAME_SELECTED, { frame_id: id }),
    trackAdminLogin:     ()       => track(GA_EVENTS.ADMIN_LOGIN),
    trackUpload:         (url)    => track(GA_EVENTS.UPLOAD_CLOUD, { url }),
  }
}
