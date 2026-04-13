import React, { useState } from 'react'
import { ArrowLeft, Save, Type, Palette, Image, ToggleLeft, ToggleRight, X, Upload, Sparkles } from 'lucide-react'
import Button from '../../components/ui/Button'
import Field from './Field'

export default function FrameEditor({ frame, onSave, onCancel, isNew = false }) {
  const [data, setData] = useState({ ...frame })
  const [activeTab, setActiveTab] = useState('basic')

  const update = (path, value) => {
    setData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev))
      const keys  = path.split('.')
      let obj     = clone
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return clone
    })
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { alert('Logo must be under 500KB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => update('logo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleOverlayUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Overlay must be under 2MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => update('overlay', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Back to Templates
        </button>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" onClick={onCancel} className="bg-white border border-slate-200 hover:bg-slate-50">Discard</Button>
          <Button
            variant="primary" size="md" onClick={() => onSave(data)} leftIcon={<Save size={16} />}
            className="!bg-indigo-600 !text-white !border-indigo-600 hover:!bg-indigo-700 shadow-sm"
          >
            {isNew ? 'Create Template' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Tabs & Form Fields */}
        <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex gap-6 border-b border-slate-200 px-6 pt-4 bg-slate-50/50">
            {[
              { id: 'basic', label: 'Info & Access' },
              { id: 'design', label: 'Design & Text' },
              { id: 'assets', label: 'Graphics & Overlays' }
            ].map(tab => (
               <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-semibold text-sm transition-all border-b-2 px-1 ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── TAB: BASIC INFO ── */}
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Type size={18} className="text-slate-400" /> Basic Details
                  </h3>
                  <div className="space-y-4">
                    <Field label="Template Name">
                      <input className="editor-input" value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g., My Custom Frame" />
                    </Field>
                    <Field label="Description">
                      <input className="editor-input" value={data.description} onChange={(e) => update('description', e.target.value)} placeholder="Short description" />
                    </Field>
                    <Field label="Template ID (slug)">
                      <input className="editor-input font-mono bg-slate-50" value={data.id} onChange={(e) => update('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="my-custom-frame" />
                      <p className="text-xs text-slate-400 mt-1">Used as a unique identifier. Hyphens only.</p>
                    </Field>
                  </div>
                </section>
                
                <hr className="border-slate-100" />

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="font-bold text-slate-900">Access Control</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Should this template be restricted to premium/admin-only events?</p>
                  
                  <label className="flex items-center gap-3 cursor-pointer bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        update('premium', !data.premium)
                        update('category', !data.premium ? 'premium' : 'free')
                      }}
                    >
                      {data.premium ? <ToggleRight size={36} className="text-amber-500" /> : <ToggleLeft size={36} className="text-slate-300" />}
                    </button>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Premium Lock</span>
                      <span className="text-xs font-medium text-slate-500">{data.premium ? 'Active - Hidden from free users' : 'Inactive - Open to everyone'}</span>
                    </div>
                  </label>
                </section>
              </div>
            )}

            {/* ── TAB: DESIGN & TEXT ── */}
            {activeTab === 'design' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Palette size={18} className="text-slate-400" /> Frame Styling
                  </h3>
                  <div className="space-y-4">
                    <Field label="Background Color">
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={data.canvas?.backgroundColor || '#ffffff'}
                          onChange={(e) => update('canvas.backgroundColor', e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200 overflow-hidden p-0"
                        />
                        <input
                          className="editor-input flex-1 font-mono uppercase"
                          value={data.canvas?.backgroundColor || '#ffffff'}
                          onChange={(e) => update('canvas.backgroundColor', e.target.value)}
                        />
                      </div>
                    </Field>
                  </div>
                </section>

                <hr className="border-slate-100" />

                <section>
                  <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Type size={18} className="text-slate-400" /> Footer Text Settings
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-semibold text-slate-600">Enable</span>
                      <button type="button" onClick={() => update('footer.show', !data.footer?.show)}>
                        {data.footer?.show ? <ToggleRight size={32} className="text-indigo-600" /> : <ToggleLeft size={32} className="text-slate-300" />}
                      </button>
                    </label>
                  </div>

                  {data.footer?.show ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Branding Default Text">
                          <input className="editor-input" value={data.footer?.text || ''} onChange={(e) => update('footer.text', e.target.value)} placeholder="snapfromhome" />
                        </Field>
                        <Field label="Custom Event Text">
                          <input className="editor-input" value={data.footer?.customText || ''} onChange={(e) => update('footer.customText', e.target.value)} placeholder="Sarah & James" />
                        </Field>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Text Color">
                          <div className="flex gap-3 items-center">
                            <input type="color" value={data.footer?.color || '#999999'} onChange={(e) => update('footer.color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0" />
                            <input className="editor-input flex-1 font-mono uppercase" value={data.footer?.color || '#999999'} onChange={(e) => update('footer.color', e.target.value)} />
                          </div>
                        </Field>
                        <Field label="Font Family">
                          <select className="editor-input" value={data.footer?.fontFamily || 'Inter'} onChange={(e) => update('footer.fontFamily', e.target.value)}>
                            <option value="Inter">Inter (Modern)</option>
                            <option value="Playfair Display">Playfair Display (Elegant)</option>
                            <option value="JetBrains Mono">JetBrains Mono (Tech)</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Footer text is currently hidden for this template.</p>
                  )}
                </section>
              </div>
            )}

            {/* ── TAB: ASSETS ── */}
            {activeTab === 'assets' && (
              <div className="space-y-8 animate-fade-in">
                <section>
                  <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Image size={18} className="text-slate-400" /> Graphics & Overlays
                  </h3>
                  
                  <div className="space-y-8">
                    <Field label="Logo (Max 500KB)">
                      <div className="flex items-center gap-4">
                        {data.logo ? (
                          <div className="relative group rounded-xl border border-slate-200 p-2 bg-slate-50 w-40 h-24 flex flex-col items-center justify-center">
                            <img src={data.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                              <button onClick={() => update('logo', null)} className="text-white text-xs font-semibold bg-red-500 px-3 py-1.5 rounded-lg flex gap-1 items-center"><X size={12}/> Remove</button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl p-5 text-center cursor-pointer transition-colors max-w-sm">
                            <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                            <span className="text-sm font-semibold text-slate-600 block">Upload Vector/Logo (PNG)</span>
                            <input type="file" accept="image/png,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
                          </label>
                        )}
                      </div>
                    </Field>

                    <Field label="Frame Overlay (Max 2MB)">
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                        Upload a transparent PNG that will be drawn *over* the photos. For best results, use exact dimensions matching your canvas config (default: 630x1980px).
                      </p>
                      <div className="flex flex-col gap-3">
                        {data.overlay ? (
                          <div className="relative group rounded-xl border border-slate-200 p-4 bg-slate-50 w-full max-w-sm flex flex-col items-center justify-center">
                            <img src={data.overlay} alt="Overlay" className="h-48 object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                              <button onClick={() => update('overlay', null)} className="text-white text-sm font-semibold bg-red-500 px-4 py-2 rounded-lg flex gap-1.5 items-center"><X size={16}/> Remove Overlay</button>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl p-8 text-center cursor-pointer transition-colors max-w-sm">
                            <Image size={24} className="mx-auto text-slate-400 mb-3" />
                            <span className="text-sm font-semibold text-slate-600 block">Browse for Overlay.png</span>
                            <input type="file" accept="image/png" className="hidden" onChange={handleOverlayUpload} />
                          </label>
                        )}
                      </div>
                    </Field>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Preview */}
        <div className="flex flex-col bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sticky top-28">
          <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Live Preview</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-6 mx-auto w-full max-w-[280px]">
             <div className="shadow-lg rounded" style={{ backgroundColor: data.canvas?.backgroundColor || '#fff', width: '100%', aspectRatio: '630/1980' }}>
             </div>
             {/* Note: Full live preview drawing omitted for clarity, but the frame acts as a placeholder */}
             <div className="absolute flex flex-col justify-center items-center opacity-30 gap-2 font-semibold text-xs tracking-wider uppercase text-slate-900 mix-blend-difference pointer-events-none">
               Photos
               <ArrowLeft size={16} className="-rotate-90"/>
             </div>
          </div>
          <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed">
            Preview frame placeholder. 
          </p>
        </div>
      </div>
    </div>
  )
}
