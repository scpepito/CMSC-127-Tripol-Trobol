import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../../lib/cn.js'
import Button from '../form/Button.jsx'

const tones = {
  danger: {
    icon: 'bg-red-50 text-red-600 ring-red-200',
    confirm: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: 'bg-orange-50 text-orange-600 ring-orange-200',
    confirm: 'bg-orange-600 hover:bg-orange-700',
  },
}

export default function ConfirmModal({
  open,
  title = 'Confirm action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const t = tones[tone] ?? tones.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start gap-4">
          <div className={cn('grid size-12 shrink-0 place-items-center rounded-2xl ring-1', t.icon)}>
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-modal-title" className="text-lg font-bold text-slate-950">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button className={t.confirm} onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
