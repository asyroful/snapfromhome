import React, { useState } from 'react'
import { Check, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import Field from './Field'
import useAdminStore from '../../stores/adminStore'

export default function SiteSettingsPanel() {
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
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-7 space-y-5">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Site Identity</h3>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Site Name">
            <input className="editor-input" value={data.siteName} onChange={(e) => setData({ ...data, siteName: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <input className="editor-input" value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-7 space-y-5">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Capture Settings</h3>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Default Countdown (seconds)">
            <input type="number" className="editor-input" min={3} max={30} value={data.defaultCountdown} onChange={(e) => setData({ ...data, defaultCountdown: +e.target.value })} />
          </Field>
          <Field label="Max Uploads per Day per IP">
            <input type="number" className="editor-input" min={1} max={50} value={data.maxUploadsPerDay} onChange={(e) => setData({ ...data, maxUploadsPerDay: +e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          leftIcon={saved ? <Check size={18} /> : <Save size={18} />}
          className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 shadow-md"
        >
          {saved ? 'Saved Successfully!' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
