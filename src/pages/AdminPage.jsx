import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Shield, LogOut, LayoutGrid, Settings, Home } from 'lucide-react'
import useAdminStore from '../stores/adminStore'
import AdminLogin from '../components/admin/AdminLogin'
import FrameManager from '../components/admin/FrameManager'
import FrameEditor from '../components/admin/FrameEditor'
import SiteSettingsPanel from '../components/admin/SiteSettingsPanel'

export default function AdminPage() {
  const isAuth   = useAdminStore((s) => s.isAuthenticated)
  const logout   = useAdminStore((s) => s.logout)
  const navigate = useNavigate()
  
  // view: 'frames' | 'settings' | 'edit-frame'
  const [view, setView] = useState('frames')
  const [activeFrame, setActiveFrame] = useState(null)

  if (!isAuth) return <AdminLogin />

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* ── SIDEBAR ─────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col py-6 px-4 min-h-screen sticky top-0 bg-white border-r border-slate-200">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
            <Camera size={14} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 tracking-tight">snapfromhome</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {[
            { id: 'frames',   label: 'Frame Templates', icon: <LayoutGrid size={16} /> },
            { id: 'settings', label: 'Site Settings',   icon: <Settings size={16} /> },
          ].map(({ id, label, icon }) => {
            // Treat 'edit-frame' as part of 'frames' tab
            const isActive = view === id || (id === 'frames' && view === 'edit-frame')
            return (
            <button
              key={id}
              onClick={() => { setView(id); setActiveFrame(null) }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {icon} {label}
            </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 pt-4 mt-4 flex flex-col gap-1.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-medium"
          >
            <Home size={16} /> View Site
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── CONTENT ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-10 py-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {view === 'frames' && 'Frame Templates'}
              {view === 'settings' && 'Site Settings'}
              {view === 'edit-frame' && (activeFrame?.id ? 'Edit Template' : 'New Template')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {view === 'frames' && 'Manage your photobooth layouts and overlays'}
              {view === 'settings' && 'Configure global app constraints'}
              {view === 'edit-frame' && 'Customize frame dimensions, colors, and overlays'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
            <Shield size={14} className="text-slate-900" />
            Admin Mode
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          {view === 'frames'   && (
            <FrameManager 
              onEdit={(frame) => { setActiveFrame(frame); setView('edit-frame') }}
              onAdd={() => { setActiveFrame(newFrameTemplate()); setView('edit-frame') }}
            />
          )}
          {view === 'settings' && <SiteSettingsPanel />}
          {view === 'edit-frame' && (
            <FrameEditor 
              frame={activeFrame} 
              isNew={!useAdminStore.getState().frames.find(f => f.id === activeFrame.id)}
              onSave={(data) => {
                const store = useAdminStore.getState()
                if (store.frames.find(f => f.id === activeFrame.id)) {
                  store.updateFrame(activeFrame.id, data)
                } else {
                  store.addFrame(data)
                }
                setView('frames')
                setActiveFrame(null)
              }}
              onCancel={() => { setView('frames'); setActiveFrame(null) }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function newFrameTemplate() {
  return {
    id: `custom-${Date.now()}`,
    name: 'New Frame',
    description: 'My custom frame template',
    category: 'free',
    thumbnail: null,
    overlay: null,
    canvas: { width: 630, height: 1980, backgroundColor: '#ffffff' },
    slots: [
      { id: 1, x: 45, y: 45,   width: 540, height: 540, borderRadius: 0 },
      { id: 2, x: 45, y: 645,  width: 540, height: 540, borderRadius: 0 },
      { id: 3, x: 45, y: 1245, width: 540, height: 540, borderRadius: 0 },
    ],
    footer: {
      show: true, y: 1845, height: 90,
      text: 'snapfromhome', customText: '',
      fontFamily: 'Inter', fontSize: 28, fontWeight: '400',
      color: '#999999', textAlign: 'center', customizable: true,
    },
    logo: null,
    premium: false,
  }
}
