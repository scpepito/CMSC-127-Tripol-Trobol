import { User, Landmark } from 'lucide-react'
import { cn } from '../../lib/cn.js'

function formatLongDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(d)
}

function Field({ label, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
        {label}
      </div>
      <div className="mt-1 min-w-0 text-base font-semibold text-white">
        {children}
      </div>
    </div>
  )
}

export default function DriverDetailsHero({
  licenseNumber,
  name,
  type,
  status,
  issued,
  expires,
  footer = 'Land Transportation Office',
  className,
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl bg-linear-to-bl from-[#8981d2] to-[#6B63B5] px-10 py-8 text-white',
        'shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/10',
        'transition-all hover:shadow-xl hover:scale-[1.02]', 
        className,
        
      )}
    >
      <div className="absolute right-10 top-8 grid size-16 place-items-center rounded-full bg-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.2),0px_4px_6px_0px_rgba(0,0,0,0.12)]">
        <User className="size-7 text-[#6f67c0]" />
      </div>

      <div className="grid grid-cols-1 gap-10 pr-20 md:grid-cols-2">
        <div className="space-y-8">
          <Field label="License Number" labelClassName="tracking-tight">
            <div className="text-3xl font-semibold tracking-tight">
              {licenseNumber}
            </div>
          </Field>
          <Field label="Type">{type}</Field>
          <Field label="Issued">{formatLongDate(issued)}</Field>
        </div>

        <div className="space-y-8">
          <Field label="Name">
            <div className="text-2xl font-semibold tracking-tight">{name}</div>
          </Field>
          <Field label="Status">{status}</Field>
          <Field label="Expires">{formatLongDate(expires)}</Field>
        </div>
      </div>

      <div className="mt-10 h-px w-full bg-white/25" />

      <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
        <Landmark className="size-4 text-white/70" />
        <span>{footer}</span>
      </div>
    </section>
  )
}

