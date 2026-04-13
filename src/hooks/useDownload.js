import { useCallback } from 'react'
import { canvasToBlob } from '../lib/canvas'

/**
 * useDownload — handles downloading generated images
 */
export function useDownload() {
  /**
   * Trigger file download from a canvas or dataUrl
   * @param {HTMLCanvasElement|string} source — canvas or dataUrl
   * @param {string} filename
   * @param {'image/jpeg'|'image/webp'} format
   * @param {number} quality
   */
  const downloadCanvas = useCallback(async (source, filename = 'snapfromhome', format = 'image/jpeg', quality = 0.88) => {
    try {
      let blob
      if (typeof source === 'string') {
        // It's a dataUrl — convert to blob
        const res = await fetch(source)
        blob = await res.blob()
      } else {
        blob = await canvasToBlob(source, format, quality)
      }

      const ext = format === 'image/webp' ? 'webp' : 'jpg'
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${filename}.${ext}`
      a.click()
      URL.revokeObjectURL(url)

      return blob
    } catch (e) {
      console.error('Download failed:', e)
      throw e
    }
  }, [])

  /**
   * Share via Web Share API (mobile) or fall back to download
   */
  const shareOrDownload = useCallback(async (source, filename, format = 'image/jpeg', quality = 0.88) => {
    try {
      let blob
      if (typeof source === 'string') {
        const res = await fetch(source)
        blob = await res.blob()
      } else {
        blob = await canvasToBlob(source, format, quality)
      }

      const ext  = format === 'image/webp' ? 'webp' : 'jpg'
      const file = new File([blob], `${filename}.${ext}`, { type: format })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title:  'My SnapFromHome Photostrip',
          text:   'Check out my photobooth strip! 📸',
          files:  [file],
        })
        return
      }

      // Fallback to download
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${filename}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Share/download failed:', e)
        throw e
      }
    }
  }, [])

  return { downloadCanvas, shareOrDownload }
}
