import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download, Printer, RotateCcw, Share2, Home,
  Loader2, Camera, CheckCircle2, ChevronDown, Film, Scissors, Palette
} from 'lucide-react'
import Button          from '../components/ui/Button'
import useBoothStore   from '../stores/boothStore'
import { useDownload } from '../hooks/useDownload'
import { useAnalytics } from '../hooks/useAnalytics'
import {
  renderStrip, renderPrintLayout, canvasToDataUrl, canvasToBlob,
} from '../lib/canvas'

const EFFECTS = [
  { id: 'none', label: 'Normal', filter: 'none' },
  { id: 'bw', label: 'B&W', filter: 'grayscale(100%)' },
  { id: 'vintage', label: 'Vintage', filter: 'sepia(60%) contrast(110%) brightness(90%) hue-rotate(350deg)' },
  { id: 'warm', label: 'Warm', filter: 'sepia(30%) saturate(140%) hue-rotate(345deg)' },
]

export default function PreviewPage() {
  const navigate = useNavigate()

  const photos       = useBoothStore((s) => s.photos)
  const selectedFrame = useBoothStore((s) => s.selectedFrame)
  const resetBooth   = useBoothStore((s) => s.resetBooth)
  const singleUrl    = useBoothStore((s) => s.singleStripDataUrl)
  const printUrl     = useBoothStore((s) => s.printLayoutDataUrl)
  const setSingleUrl = useBoothStore((s) => s.setSingleStripDataUrl)
  const setPrintUrl  = useBoothStore((s) => s.setPrintLayoutDataUrl)

  const { downloadCanvas, shareOrDownload } = useDownload()
  const { trackDownloadSingle, trackDownloadPrint, trackStripGenerated, trackRetake } = useAnalytics()

  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab,    setActiveTab]    = useState('single')
  const [activeEffectId, setActiveEffectId] = useState('none')
  const [downloadingId, setDownloadingId] = useState(null)
  const isGeneratedRef = useRef(false)

  // Redirect guard
  useEffect(() => {
    if (!selectedFrame || photos.length < 3) {
      navigate('/')
    }
  }, [selectedFrame, photos, navigate])

  // Generate strips on mount
  useEffect(() => {
    if (isGeneratedRef.current) return
    if (!selectedFrame || photos.length < 3) return
    isGeneratedRef.current = true
    generateStrips()
  }, [selectedFrame, photos])

  const generateStrips = async (effectId = activeEffectId) => {
    setIsGenerating(true)
    const eff = EFFECTS.find(e => e.id === effectId)?.filter || 'none'
    try {
      // Single strip
      const stripCanvas  = await renderStrip(photos, selectedFrame, { effectFilter: eff })
      const stripDataUrl = canvasToDataUrl(stripCanvas, 'image/jpeg', 0.90)
      setSingleUrl(stripDataUrl)

      // Print layout
      const printCanvas  = await renderPrintLayout(photos, selectedFrame, { effectFilter: eff })
      const printDataUrl = canvasToDataUrl(printCanvas, 'image/jpeg', 0.88)
      setPrintUrl(printDataUrl)

      trackStripGenerated(selectedFrame.id)
    } catch (e) {
      console.error('Strip generation failed:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadSingle = async () => {
    if (!singleUrl) return
    setDownloadingId('single')
    try {
      await downloadCanvas(singleUrl, `snapfromhome-strip-${Date.now()}`, 'image/jpeg', 0.92)
      trackDownloadSingle()
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDownloadPrint = async () => {
    if (!printUrl) return
    setDownloadingId('print')
    try {
      await downloadCanvas(printUrl, `snapfromhome-print-${Date.now()}`, 'image/jpeg', 0.90)
      trackDownloadPrint()
    } finally {
      setDownloadingId(null)
    }
  }

  const handleShare = async () => {
    if (!singleUrl) return
    setDownloadingId('share')
    try {
      await shareOrDownload(singleUrl, `snapfromhome-strip-${Date.now()}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRetake = () => {
    trackRetake()
    resetBooth()
    navigate('/')
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-booth-bg">
        <div className="animated-bg" />
        <div className="glass-card p-10 flex flex-col items-center gap-5 max-w-sm w-full mx-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-booth-pink/30 border-t-booth-pink animate-spin" />
            <Camera size={22} className="text-booth-pink absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold font-display gradient-text mb-1">
              Creating Your Strip
            </h2>
            <p className="text-booth-muted text-sm">Compositing your photos…</p>
          </div>
          <div className="flex gap-2">
            {photos.map((url, i) => (
              <div key={i} className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-white/10">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPreviewUrl = activeTab === 'single' ? singleUrl : printUrl

  return (
    <div className="min-h-screen flex flex-col bg-booth-bg">
      <div className="animated-bg" />

      {/* ── TOPBAR ─────────────────────────────── */}
      <header className="relative flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <button
          onClick={() => navigate('/')}
          className="btn-ghost text-sm gap-1.5"
        >
          <Home size={16} /> Home
        </button>
        <span className="font-display font-bold text-sm gradient-text">snapfromhome</span>
        <button onClick={handleRetake} className="btn-ghost text-sm gap-1.5">
          <RotateCcw size={16} /> Retake
        </button>
      </header>

      {/* ── MAIN ──────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Preview ─────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Success banner */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-fade-in">
              <CheckCircle2 size={16} />
              Your photostrip is ready!
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-1 glass-card">
              {[
                { id: 'single', label: <span className="flex items-center gap-2 justify-center"><Film size={16} /> Single Strip</span> },
                { id: 'print',  label: <span className="flex items-center gap-2 justify-center"><Printer size={16} /> Print 4×6</span> },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-booth-pink/90 to-booth-purple/90 text-white shadow-glow-pink'
                      : 'text-booth-muted hover:text-booth-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Effect switcher */}
            <div className="flex gap-2 p-2 overflow-x-auto hide-scrollbar glass-card">
              <div className="flex items-center gap-1.5 px-2 text-booth-muted">
                <Palette size={14} />
              </div>
              {EFFECTS.map((eff) => (
                <button
                  key={eff.id}
                  onClick={() => {
                    if (activeEffectId === eff.id) return
                    setActiveEffectId(eff.id)
                    generateStrips(eff.id)
                  }}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeEffectId === eff.id
                      ? 'bg-booth-pink/20 text-booth-pink border border-booth-pink/30'
                      : 'text-booth-muted hover:text-booth-text bg-white/[0.03] border border-transparent'
                  }`}
                >
                  {eff.label}
                </button>
              ))}
            </div>

            {/* Preview image */}
            <div className="glass-card p-3 flex items-center justify-center min-h-[300px]">
              {currentPreviewUrl ? (
                <img
                  src={currentPreviewUrl}
                  alt={activeTab === 'single' ? 'Photostrip preview' : '4x6 print layout preview'}
                  className="max-h-[600px] w-auto object-contain strip-shadow rounded-lg animate-fade-in"
                />
              ) : (
                <div className="flex items-center justify-center text-booth-muted py-12">
                  <Loader2 size={24} className="animate-spin mr-2" />
                  Generating…
                </div>
              )}
            </div>

            {activeTab === 'print' && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-booth-muted text-center">
                <Scissors size={12} className="text-booth-dim" /> Dashed line in the center is a cut guide for printing
              </p>
            )}
          </div>

          {/* ── RIGHT: Actions ─────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Frame info */}
            <div className="glass-card p-4">
              <p className="text-xs text-booth-muted uppercase tracking-wider mb-1">Template used</p>
              <p className="font-semibold text-booth-text">{selectedFrame?.name}</p>
              <p className="text-sm text-booth-dim mt-0.5">{selectedFrame?.description}</p>
            </div>

            {/* Download options */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-booth-text font-display mb-4">Download</h3>

              <div className="flex flex-col gap-3">
                <Button
                  id="download-single-btn"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={downloadingId === 'single'}
                  onClick={handleDownloadSingle}
                  disabled={!singleUrl}
                  leftIcon={<Download size={18} />}
                >
                  Single Strip (JPG)
                </Button>

                <Button
                  id="download-print-btn"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  loading={downloadingId === 'print'}
                  onClick={handleDownloadPrint}
                  disabled={!printUrl}
                  leftIcon={<Printer size={18} />}
                >
                  Print Layout 4×6 (JPG)
                </Button>

                <Button
                  id="share-btn"
                  variant="ghost"
                  size="md"
                  fullWidth
                  loading={downloadingId === 'share'}
                  onClick={handleShare}
                  disabled={!singleUrl}
                  leftIcon={<Share2 size={16} />}
                >
                  Share Photostrip
                </Button>
              </div>
            </div>

            {/* Thumbnail thumbnails */}
            <div className="glass-card p-4">
              <p className="text-xs text-booth-muted uppercase tracking-wider mb-3">Your Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden ring-1 ring-white/10">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Retake / New session */}
            <div className="flex gap-3">
              <Button
                id="retake-btn"
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleRetake}
                leftIcon={<RotateCcw size={16} />}
              >
                New Session
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
