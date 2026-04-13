import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Sparkles, ChevronRight, Star, Download, Zap, LayoutTemplate, Check, Heart } from 'lucide-react'
import Button from '../components/ui/Button'
import FrameSelector from '../components/frames/FrameSelector'
import useBoothStore from '../stores/boothStore'
import { useAnalytics } from '../hooks/useAnalytics'

export default function HomePage() {
  const navigate        = useNavigate()
  const setSelectedFrame = useBoothStore((s) => s.setSelectedFrame)
  const selectedFrame   = useBoothStore((s) => s.selectedFrame)
  const resetBooth      = useBoothStore((s) => s.resetBooth)
  const { trackFrameSelected, trackCameraStart } = useAnalytics()

  const handleFrameSelect = (frame) => {
    setSelectedFrame(frame)
    trackFrameSelected(frame.id)
  }

  const handleStart = () => {
    if (!selectedFrame) return
    resetBooth()
    setSelectedFrame(selectedFrame) // re-set after reset
    trackCameraStart({ frame: selectedFrame.id })
    navigate('/booth')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="animated-bg" />

      {/* ── HERO ─────────────────────────────────── */}
      <header className="relative pt-16 pb-10 px-4 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-booth flex items-center justify-center shadow-glow-pink">
            <Camera size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold font-display gradient-text">
            snapfromhome
          </span>
        </div>

        {/* Tagline */}
        <div className="max-w-xl mx-auto animate-slide-up">
          <h1 className="text-5xl sm:text-6xl font-bold font-display leading-tight text-booth-text mb-4">
            Your Photobooth,
            <br />
            <span className="gradient-text">Anywhere</span>
          </h1>
          <p className="text-booth-muted text-lg leading-relaxed">
            Take 3 photos with your camera, get a beautiful
            photostrip instantly — no app needed.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in">
          {[
            { icon: <Zap size={12} />,        label: '7s auto-capture' },
            { icon: <Sparkles size={12} />,   label: 'Flash effect' },
            { icon: <Download size={12} />,   label: 'Free download' },
            { icon: <Star size={12} />,       label: 'Print-ready 4×6' },
          ].map(({ icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-booth-muted text-xs">
              {icon} {label}
            </span>
          ))}
        </div>
      </header>

      {/* ── MAIN ─────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-16">

        {/* Frame selector */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold font-display text-booth-text">
                Choose Your Frame
              </h2>
              <p className="text-booth-muted text-sm mt-0.5">
                Pick a template for your photostrip
              </p>
            </div>
            {selectedFrame && (
              <span className="badge-new flex items-center gap-1.5">
                <Check size={12} /> {selectedFrame.name} selected
              </span>
            )}
          </div>

          <FrameSelector
            selectedId={selectedFrame?.id}
            onSelect={handleFrameSelect}
          />
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Button
            id="start-booth-btn"
            variant="primary"
            size="xl"
            disabled={!selectedFrame}
            onClick={handleStart}
            leftIcon={<Camera size={20} />}
            rightIcon={<ChevronRight size={20} />}
            className="min-w-[220px]"
          >
            Start Photobooth
          </Button>

          {!selectedFrame && (
            <p className="text-booth-muted text-sm">← Select a frame first</p>
          )}
        </div>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-bold font-display gradient-text mb-2">How It Works</h2>
          <p className="text-booth-muted text-sm mb-8">Three steps to your perfect photostrip</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                icon: <LayoutTemplate size={32} className="text-booth-pink" />,
                title: 'Pick a Frame',
                desc: 'Choose from minimal, cute, wedding, or birthday templates',
              },
              {
                step: '02',
                icon: <Camera size={32} className="text-booth-pink" />,
                title: 'Strike a Pose',
                desc: '7-second countdown for each of 3 photos — get creative!',
              },
              {
                step: '03',
                icon: <Download size={32} className="text-booth-pink" />,
                title: 'Download & Print',
                desc: 'Get your single strip or print-ready 4×6 layout instantly',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="glass-card p-6 text-left group hover:border-booth-pink/20 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <p className="text-[10px] font-mono text-booth-pink mb-1">{step}</p>
                    <h3 className="font-semibold text-booth-text mb-1">{title}</h3>
                    <p className="text-sm text-booth-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-6 px-4 text-center">
        <p className="text-booth-dim text-xs flex items-center justify-center gap-1.5">
          © {new Date().getFullYear()} SnapFromHome
        </p>
      </footer>
    </div>
  )
}
