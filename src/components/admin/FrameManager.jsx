import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Type } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import useAdminStore from '../../stores/adminStore'

export default function FrameManager({ onEdit, onAdd }) {
  const frames       = useAdminStore((s) => s.frames)
  const deleteFrame  = useAdminStore((s) => s.deleteFrame)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleDelete = (frame) => {
    deleteFrame(frame.id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex justify-end mb-8">
        <Button
          id="add-frame-btn"
          variant="primary"
          size="md"
          onClick={onAdd}
          leftIcon={<Plus size={16} />}
          className="!bg-indigo-600 !text-white !border-indigo-600 hover:!bg-indigo-700 shadow-sm"
        >
          Create Template
        </Button>
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {frames.map((frame) => (
          <div key={frame.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 truncate text-base">{frame.name}</h3>
                  {frame.premium ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"><Sparkles size={10} />Pro</span>
                  ) : (
                    <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Free</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 line-clamp-1">{frame.description}</p>
              </div>
            </div>

            {/* Mini preview */}
            <div
              className="rounded-xl overflow-hidden h-32 flex border border-slate-100 shadow-inner"
              style={{ backgroundColor: frame.canvas?.backgroundColor || '#fff' }}
            >
              <div className="flex-1 flex flex-col p-2.5 gap-1.5 opacity-50">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex-1 rounded border border-black/10 bg-black/10" />
                ))}
              </div>
            </div>

            {/* Footer text display */}
            {frame.footer?.show ? (
              <div className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-2 rounded-lg truncate border border-slate-100" style={{ color: frame.footer.color }}>
                <Type size={12} className="inline mr-1.5 opacity-50" />
                {frame.footer.customText || frame.footer.text}
              </div>
            ) : (
               <div className="text-xs font-medium text-slate-300 bg-slate-50 px-3 py-2 rounded-lg truncate border border-slate-50 italic">
                 No footer text
               </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 mt-auto">
              <button
                onClick={() => onEdit(frame)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-all"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(frame)}
                disabled={frames.length <= 1}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-100 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Template?"
        size="sm"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete <strong className="text-slate-900">"{deleteConfirm?.name}"</strong>? This template will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" fullWidth onClick={() => setDeleteConfirm(null)} className="border border-slate-200">Cancel</Button>
          <Button variant="danger" size="md" fullWidth onClick={() => handleDelete(deleteConfirm)}>Confirm Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
