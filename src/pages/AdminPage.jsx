import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock, Eye, EyeOff, Camera, Shield, LogOut,
  LayoutGrid, Settings, Plus, Pencil, Trash2,
  Sparkles, ChevronRight, Check, X, Upload,
  Type, Palette, Image, ToggleLeft, ToggleRight,
  Save, RotateCcw, Home,
} from 'lucide-react'
import Button        from '../components/ui/Button'
import Modal         from '../components/ui/Modal'
import useAdminStore from '../stores/adminStore'
import { useAnalytics } from '../hooks/useAnalytics'

export default function AdminPage() {
  const isAuth   = useAdminStore((s) => s.isAuthenticated)
  const logout   = useAdminStore((s) => s.logout)
  const navigate = useNavigate()
  const [section, setSection] = useState('frames')

  if (!isAuth) return <AdminLogin />

  return (
    <div className="min-h-screen flex bg-booth-bg">
      <div className="animated-bg" />

      {/* ── SIDEBAR ─────────────────────────── */}
      <aside className="admin-sidebar w-60 flex-shrink-0 flex flex-col py-6 px-3 min-h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-booth flex items-center justify-center">
            <Camera size={14} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm gradient-text">snapfromhome</p>
            <p className="text-[10px] text-booth-dim">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {[
            { id: 'frames',   label: 'Frame Templates', icon: <LayoutGrid size={16} /> },
            { id: 'settings', label: 'Site Settings',   icon: <Settings size={16} /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === id
                  ? 'bg-booth-pink/15 text-booth-pink border border-booth-pink/20'
                  : 'text-booth-muted hover:text-booth-text hover:bg-white/[0.05]'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/[0.05] pt-4 mt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-booth-muted hover:text-booth-text hover:bg-white/[0.05] transition-all"
          >
            <Home size={15} /> View Site
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── CONTENT ─────────────────────────── */}
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-5 border-b border-white/[0.05] flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-booth-text">
              {section === 'frames' ? 'Frame Templates' : 'Site Settings'}
            </h1>
            <p className="text-sm text-booth-muted mt-0.5">
              {section === 'frames' ? 'Manage your photobooth templates' : 'Configure global app settings'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 glass-card text-xs text-booth-muted">
            <Shield size={12} className="text-booth-pink" />
            Admin Mode
          </div>
        </header>

        <main className="flex-1 p-8">
          {section === 'frames'   && <FrameManager />}
          {section === 'settings' && <SiteSettingsPanel />}
        </main>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ADMIN LOGIN
───────────────────────────────────────────────────────────────── */
function AdminLogin() {
  const login    = useAdminStore((s) => s.login)
  const navigate = useNavigate()
  const { trackAdminLogin } = useAnalytics()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    await sleep(400)
    const ok = login(username, password)
    setLoading(false)
    if (ok) { trackAdminLogin() }
    else    { setError('Invalid username or password.') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-booth-bg px-4">
      <div className="animated-bg" />
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-booth flex items-center justify-center mx-auto mb-4 shadow-glow-pink">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display gradient-text">Admin Login</h1>
          <p className="text-booth-muted text-sm mt-1">SnapFromHome Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium text-booth-text mb-1.5">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              className="input-field"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-booth-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                className="input-field pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-booth-muted hover:text-booth-text transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            leftIcon={<Shield size={16} />}
          >
            Sign In
          </Button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-center text-sm text-booth-muted hover:text-booth-text transition-colors"
          >
            ← Back to site
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   FRAME MANAGER
───────────────────────────────────────────────────────────────── */
function FrameManager() {
  const frames       = useAdminStore((s) => s.frames)
  const updateFrame  = useAdminStore((s) => s.updateFrame)
  const deleteFrame  = useAdminStore((s) => s.deleteFrame)
  const addFrame     = useAdminStore((s) => s.addFrame)

  const [editingFrame, setEditingFrame] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showAddModal, setShowAddModal]   = useState(false)

  const handleDelete = (frame) => {
    deleteFrame(frame.id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <Button
          id="add-frame-btn"
          variant="primary"
          size="md"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus size={16} />}
        >
          Add Frame
        </Button>
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {frames.map((frame) => (
          <div key={frame.id} className="glass-card-hover p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-booth-text truncate">{frame.name}</h3>
                  {frame.premium ? (
                    <span className="badge-premium text-[10px]"><Sparkles size={9} />Pro</span>
                  ) : (
                    <span className="badge-free text-[10px]">Free</span>
                  )}
                </div>
                <p className="text-xs text-booth-muted line-clamp-1">{frame.description}</p>
                <p className="text-[10px] font-mono text-booth-dim mt-1">id: {frame.id}</p>
              </div>
            </div>

            {/* Mini preview */}
            <div
              className="rounded-lg overflow-hidden h-24 flex"
              style={{ backgroundColor: frame.canvas?.backgroundColor || '#fff' }}
            >
              <div className="flex-1 flex flex-col p-2 gap-1">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex-1 rounded-sm opacity-30 bg-gray-400" />
                ))}
              </div>
            </div>

            {/* Footer text preview */}
            {frame.footer?.show && (
              <div className="text-xs text-booth-muted truncate" style={{ color: frame.footer.color }}>
                "{frame.footer.customText || frame.footer.text}"
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-white/[0.05]">
              <button
                id={`edit-frame-${frame.id}`}
                onClick={() => setEditingFrame(frame)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-booth-muted hover:text-booth-pink hover:bg-booth-pink/10 transition-all"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                id={`delete-frame-${frame.id}`}
                onClick={() => setDeleteConfirm(frame)}
                disabled={frames.length <= 1}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-booth-muted hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Frame"
        size="sm"
      >
        <p className="text-booth-muted text-sm mb-5">
          Are you sure you want to delete <strong className="text-booth-text">"{deleteConfirm?.name}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" fullWidth onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" size="md" fullWidth onClick={() => handleDelete(deleteConfirm)} leftIcon={<Trash2 size={15} />}>Delete</Button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingFrame}
        onClose={() => setEditingFrame(null)}
        title={`Edit: ${editingFrame?.name}`}
        size="lg"
      >
        {editingFrame && (
          <FrameEditor
            frame={editingFrame}
            onSave={(updates) => {
              updateFrame(editingFrame.id, updates)
              setEditingFrame(null)
            }}
            onCancel={() => setEditingFrame(null)}
          />
        )}
      </Modal>

      {/* Add frame modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Frame Template"
        size="lg"
      >
        <FrameEditor
          frame={newFrameTemplate()}
          isNew
          onSave={(frameData) => {
            addFrame(frameData)
            setShowAddModal(false)
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   FRAME EDITOR
───────────────────────────────────────────────────────────────── */
function FrameEditor({ frame, onSave, onCancel, isNew = false }) {
  const [data, setData] = useState({ ...frame })

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
    <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* ── Basic Info ── */}
      <section>
        <FieldGroup label="Basic Info">
          <Field label="Frame Name">
            <input
              className="input-field"
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., My Custom Frame"
            />
          </Field>
          <Field label="Description">
            <input
              className="input-field"
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Short description"
            />
          </Field>
          <Field label="Template ID (slug)">
            <input
              className="input-field font-mono"
              value={data.id}
              onChange={(e) => update('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="my-custom-frame"
            />
          </Field>
        </FieldGroup>
      </section>

      {/* ── Canvas ── */}
      <section>
        <FieldGroup label="Canvas Style">
          <Field label="Background Color">
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={data.canvas?.backgroundColor || '#ffffff'}
                onChange={(e) => update('canvas.backgroundColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                className="input-field flex-1"
                value={data.canvas?.backgroundColor || '#ffffff'}
                onChange={(e) => update('canvas.backgroundColor', e.target.value)}
              />
            </div>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Footer ── */}
      <section>
        <FieldGroup label="Footer Text">
          <Field label="">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => update('footer.show', !data.footer?.show)}
                className="text-booth-pink"
              >
                {data.footer?.show
                  ? <ToggleRight size={28} />
                  : <ToggleLeft  size={28} className="text-booth-dim" />}
              </button>
              <span className="text-sm text-booth-text">Show footer</span>
            </label>
          </Field>

          {data.footer?.show && (
            <>
              <Field label="Default Text (branding)">
                <input
                  className="input-field"
                  value={data.footer?.text || ''}
                  onChange={(e) => update('footer.text', e.target.value)}
                  placeholder="snapfromhome.com"
                />
              </Field>
              <Field label="Custom Event Text (e.g., wedding/birthday)">
                <input
                  className="input-field"
                  value={data.footer?.customText || ''}
                  onChange={(e) => update('footer.customText', e.target.value)}
                  placeholder="Sarah & James • June 2025"
                />
              </Field>
              <Field label="Text Color">
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={data.footer?.color || '#999999'}
                    onChange={(e) => update('footer.color', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    className="input-field flex-1"
                    value={data.footer?.color || '#999999'}
                    onChange={(e) => update('footer.color', e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Font Family">
                <select
                  className="input-field"
                  value={data.footer?.fontFamily || 'Inter'}
                  onChange={(e) => update('footer.fontFamily', e.target.value)}
                >
                  <option value="Inter">Inter (Modern)</option>
                  <option value="Playfair Display">Playfair Display (Elegant)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Tech)</option>
                </select>
              </Field>
            </>
          )}
        </FieldGroup>
      </section>

      {/* ── Assets ── */}
      <section>
        <FieldGroup label="Assets">
          <Field label="Logo (PNG, max 500KB)">
            <div className="space-y-2">
              {data.logo && (
                <div className="flex items-center gap-2">
                  <img src={data.logo} alt="Logo preview" className="h-10 object-contain rounded" />
                  <button onClick={() => update('logo', null)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                </div>
              )}
              <label className="btn-ghost text-sm cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} /> Upload Logo
                <input type="file" accept="image/png,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </Field>

          <Field label="Frame Overlay PNG (transparent, max 2MB)">
            <div className="space-y-2">
              {data.overlay && typeof data.overlay === 'string' && data.overlay.startsWith('data:') && (
                <div className="flex items-center gap-2">
                  <img src={data.overlay} alt="Overlay preview" className="h-16 object-contain rounded" />
                  <button onClick={() => update('overlay', null)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                </div>
              )}
              <label className="btn-ghost text-sm cursor-pointer inline-flex items-center gap-2">
                <Image size={14} /> Upload Overlay
                <input type="file" accept="image/png" className="hidden" onChange={handleOverlayUpload} />
              </label>
              {data.overlay && !data.overlay?.startsWith?.('data:') && (
                <p className="text-xs text-booth-muted">Current: {data.overlay}</p>
              )}
            </div>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Premium toggle ── */}
      <section>
        <FieldGroup label="Access Control">
          <Field label="">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => {
                  update('premium', !data.premium)
                  update('category', !data.premium ? 'premium' : 'free')
                }}
                className="text-booth-gold"
              >
                {data.premium
                  ? <ToggleRight size={28} />
                  : <ToggleLeft  size={28} className="text-booth-dim" />}
              </button>
              <span className="text-sm text-booth-text">Premium template (admin-only)</span>
              {data.premium && <span className="badge-premium text-[10px]"><Sparkles size={9} /> Pro</span>}
            </label>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 border-t border-white/[0.05]">
        <Button variant="ghost" size="md" fullWidth onClick={onCancel}>Cancel</Button>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => onSave(data)}
          leftIcon={<Save size={15} />}
        >
          {isNew ? 'Create Frame' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SITE SETTINGS
───────────────────────────────────────────────────────────────── */
function SiteSettingsPanel() {
  const siteSettings     = useAdminStore((s) => s.siteSettings)
  const updateSiteSettings = useAdminStore((s) => s.updateSiteSettings)
  const [saved, setSaved] = useState(false)
  const [data, setData]   = useState({ ...siteSettings })

  const handleSave = () => {
    updateSiteSettings(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-booth-text font-display">Site Identity</h3>
        <Field label="Site Name">
          <input
            className="input-field"
            value={data.siteName}
            onChange={(e) => setData({ ...data, siteName: e.target.value })}
          />
        </Field>
        <Field label="Tagline">
          <input
            className="input-field"
            value={data.tagline}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
          />
        </Field>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-booth-text font-display">Capture Settings</h3>
        <Field label="Default Countdown (seconds)">
          <input
            type="number"
            className="input-field"
            min={3} max={30}
            value={data.defaultCountdown}
            onChange={(e) => setData({ ...data, defaultCountdown: +e.target.value })}
          />
        </Field>
        <Field label="Max Uploads per Day per IP">
          <input
            type="number"
            className="input-field"
            min={1} max={50}
            value={data.maxUploadsPerDay}
            onChange={(e) => setData({ ...data, maxUploadsPerDay: +e.target.value })}
          />
        </Field>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-booth-text font-display">Cloudinary Integration</h3>
        <Field label="Cloud Name">
          <input
            className="input-field font-mono"
            value={data.cloudinaryCloudName}
            onChange={(e) => setData({ ...data, cloudinaryCloudName: e.target.value })}
            placeholder="your-cloud-name"
          />
        </Field>
        <p className="text-xs text-booth-muted">
          Set CLOUDINARY_* environment variables in Netlify dashboard for full integration.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleSave}
        leftIcon={saved ? <Check size={16} /> : <Save size={16} />}
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </Button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function FieldGroup({ label, children }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-booth-muted">{label}</p>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-booth-text">{label}</label>}
      {children}
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
      text: 'snapfromhome.com', customText: '',
      fontFamily: 'Inter', fontSize: 28, fontWeight: '400',
      color: '#999999', textAlign: 'center', customizable: true,
    },
    logo: null,
    premium: false,
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }
