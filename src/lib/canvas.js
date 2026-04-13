/**
 * canvas.js — Core Canvas API utilities for SnapFromHome
 *
 * Handles:
 * - Capturing video frame to canvas
 * - Rendering photostrip from frame config
 * - Rendering 4x6 print layout (double strip, portrait)
 */

/**
 * Capture a single frame from a video element
 * @param {HTMLVideoElement} video
 * @param {number} [quality=0.92]
 * @returns {Promise<string>} dataUrl
 */
export async function captureVideoFrame(video, quality = 0.92) {
  const w = video.videoWidth  || video.clientWidth
  const h = video.videoHeight || video.clientHeight

  const canvas = document.createElement('canvas')
  canvas.width  = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  // Mirror effect (undo the CSS scaleX so final photo is not mirrored)
  ctx.save()
  ctx.translate(w, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, w, h)
  ctx.restore()

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * Load an image from a URL / dataUrl → HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src     = src
  })
}

/**
 * Draw an image into a slot using cover fit (center crop)
 */
function drawCover(ctx, img, x, y, w, h, borderRadius = 0, filter = 'none') {
  // Safari workaround: ctx.filter is often ignored when ctx.clip() is active.
  // We draw the filtered image to an offscreen canvas first to bypass this bug.
  const offCanvas = document.createElement('canvas')
  offCanvas.width = w
  offCanvas.height = h
  const offCtx = offCanvas.getContext('2d')

  if (filter && filter !== 'none') {
    offCtx.filter = filter
  }

  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw    = img.naturalWidth  * scale
  const sh    = img.naturalHeight * scale
  const sx    = (w - sw) / 2
  const sy    = (h - sh) / 2

  offCtx.drawImage(img, sx, sy, sw, sh)

  // Now draw the offscreen canvas onto the main canvas WITH clipping applied
  ctx.save()
  if (borderRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, borderRadius)
    ctx.clip()
  } else {
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
  }

  ctx.drawImage(offCanvas, x, y, w, h)
  ctx.restore()
}

/**
 * Render a single photostrip using frame config
 * @param {string[]} photoDataUrls — array of 3 dataUrls
 * @param {object}   frameConfig   — from frames.json
 * @param {object}   [overrides]   — optional footer text overrides
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderStrip(photoDataUrls, frameConfig, overrides = {}) {
  const { canvas: canvasCfg, slots, footer, overlay } = frameConfig

  const canvas = document.createElement('canvas')
  canvas.width  = canvasCfg.width
  canvas.height = canvasCfg.height

  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = canvasCfg.backgroundColor || '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw each photo slot
  for (let i = 0; i < slots.length; i++) {
    const slot  = slots[i]
    const photo = photoDataUrls[i]
    if (!photo) continue

    try {
      const img = await loadImage(photo)
      drawCover(ctx, img, slot.x, slot.y, slot.width, slot.height, slot.borderRadius || 0, overrides.effectFilter || 'none')
    } catch (e) {
      console.warn(`Failed to load photo [${i}]`, e)
      // Draw placeholder
      ctx.fillStyle = '#cccccc'
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height)
    }
  }

  // Overlay PNG (frame border decoration)
  if (overlay) {
    try {
      const overlayImg = await loadImage(overlay)
      ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height)
    } catch (e) {
      console.warn('Overlay image failed to load', e)
    }
  }

  // Logo
  if (frameConfig.logo) {
    try {
      const logoImg = await loadImage(frameConfig.logo)
      const logoH   = 60
      const logoW   = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH
      const logoX   = (canvas.width - logoW) / 2
      const logoY   = footer.show ? footer.y + 10 : canvas.height - 70
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH)
    } catch (e) {
      console.warn('Logo failed to load', e)
    }
  }

  // Footer text
  if (footer?.show) {
    const footerText = overrides.footerText ||
      (footer.customText ? `${footer.text}\n${footer.customText}` : footer.text)

    ctx.font = `${footer.fontWeight || '400'} ${footer.fontSize || 28}px '${footer.fontFamily || 'Inter'}', sans-serif`
    ctx.fillStyle   = footer.color || '#999999'
    ctx.textAlign   = footer.textAlign || 'center'
    ctx.textBaseline = 'middle'

    const lines = footerText.split('\n')
    const lineH  = (footer.fontSize || 28) * 1.5

    lines.forEach((line, li) => {
      const y = footer.y + footer.height / 2 + (li - (lines.length - 1) / 2) * lineH
      ctx.fillText(line, canvas.width / 2, y)
    })
  }

  return canvas
}

/**
 * Render 4x6 portrait print layout (2 strips side-by-side)
 * Canvas: 1800 × 2700px
 * Layout: 2 columns × 3 rows, portrait, with cut guide
 *
 * @param {string[]} photoDataUrls — 3 photos
 * @param {object}   frameConfig
 * @param {object}   [overrides]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderPrintLayout(photoDataUrls, frameConfig, overrides = {}) {
  const PRINT_W = 1800
  const PRINT_H = 2700

  const canvas = document.createElement('canvas')
  canvas.width  = PRINT_W
  canvas.height = PRINT_H

  const ctx = canvas.getContext('2d')

  // White background (print ready)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PRINT_W, PRINT_H)

  // ── Layout: 2 strips side-by-side ──
  // Each strip = 840px wide, centered in PRINT_W=1800
  // Gutter (cut guide area) = 60px
  // Left strip:  x=60,  w=840
  // Right strip: x=900, w=840
  // Vertical margin: 60px top/bottom

  const STRIP_W   = 840
  const STRIP_H   = 2580
  const GUTTER    = 60
  const MARGIN_X  = (PRINT_W - STRIP_W * 2 - GUTTER) / 2  // = 0 — fills edge to edge with 60 gutter
  const MARGIN_Y  = (PRINT_H - STRIP_H) / 2

  const LEFT_X   = MARGIN_X
  const RIGHT_X  = MARGIN_X + STRIP_W + GUTTER

  // Photo slots within each strip
  const PHOTO_PAD_X = 40
  const PHOTO_PAD_Y = 40
  const PHOTO_W     = STRIP_W - PHOTO_PAD_X * 2
  const PHOTO_H     = Math.floor((STRIP_H - PHOTO_PAD_Y * 4) / 3) // 3 photos + 4 gaps

  const { backgroundColor = '#ffffff' } = frameConfig.canvas || {}
  const { footer, overlay } = frameConfig

  const drawStrip = async (originX) => {
    const originY = MARGIN_Y

    // Strip background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(originX, originY, STRIP_W, STRIP_H)

    // Photos
    for (let i = 0; i < 3; i++) {
      const photo = photoDataUrls[i]
      const slotX = originX + PHOTO_PAD_X
      const slotY = originY + PHOTO_PAD_Y + i * (PHOTO_H + PHOTO_PAD_Y)

      if (photo) {
        try {
          const img = await loadImage(photo)
          drawCover(ctx, img, slotX, slotY, PHOTO_W, PHOTO_H, frameConfig.slots?.[i]?.borderRadius || 0, overrides.effectFilter || 'none')
        } catch {
          ctx.fillStyle = '#dddddd'
          ctx.fillRect(slotX, slotY, PHOTO_W, PHOTO_H)
        }
      }
    }

    // Overlay
    if (overlay) {
      try {
        const overlayImg = await loadImage(overlay)
        ctx.drawImage(overlayImg, originX, originY, STRIP_W, STRIP_H)
      } catch { /* ignore */ }
    }

    // Footer text in strip
    if (footer?.show) {
      const footerText = overrides.footerText || footer.text || 'snapfromhome'
      ctx.save()
      ctx.font = `${footer.fontWeight || '400'} ${Math.round((footer.fontSize || 28) * (STRIP_W / (frameConfig.canvas.width || 630)))}px '${footer.fontFamily || 'Inter'}', sans-serif`
      ctx.fillStyle    = footer.color || '#999999'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      const footerY = originY + STRIP_H - PHOTO_PAD_Y * 2 + (footer.fontSize || 28) * 0.5
      ctx.fillText(footerText, originX + STRIP_W / 2, footerY)
      ctx.restore()
    }
  }

  await drawStrip(LEFT_X)
  await drawStrip(RIGHT_X)

  // ── Cut guide line ──
  const cutX = MARGIN_X + STRIP_W + GUTTER / 2
  ctx.save()
  ctx.setLineDash([20, 12])
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth   = 2
  ctx.beginPath()
  ctx.moveTo(cutX, 0)
  ctx.lineTo(cutX, PRINT_H)
  ctx.stroke()

  // Scissors icon hint at top
  ctx.font         = '32px serif'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = 'rgba(0,0,0,0.2)'
  ctx.fillText('✂', cutX, 30)
  ctx.restore()

  return canvas
}

/**
 * Canvas → compressed Blob
 * @param {HTMLCanvasElement} canvas
 * @param {'image/jpeg'|'image/webp'} [format='image/jpeg']
 * @param {number} [quality=0.88]
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, format = 'image/jpeg', quality = 0.88) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      format,
      quality
    )
  })
}

/**
 * Canvas → dataURL
 */
export function canvasToDataUrl(canvas, format = 'image/jpeg', quality = 0.88) {
  return canvas.toDataURL(format, quality)
}
