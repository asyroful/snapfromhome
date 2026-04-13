import React from 'react'

export default function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
      {children}
    </div>
  )
}
