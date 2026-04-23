import { FileCheck, Landmark } from 'lucide-react'
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

export default function RegistrationDetailsHero({
  registrationNumber,
  registrationDate,
  expirationDate,
  registrationStatus,
  vehiclePlate,
  vehicleSub,
  ownerName,
  ownerLicense,
  footer = 'Land Transportation Office',
  className,
}) {
    // TODO: UPDATE ALL COLORS
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl bg-linear-to-bl from-[#E6757D] to-[#E86668] px-10 py-9 text-white',
        'shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] ring-1 ring-[#E86668] border-3 border-[#E6757D]',
        'transition-all hover:shadow-xl hover:scale-[1.02]',
        className,
      )}
    >
      <div className="absolute right-10 top-9 grid size-16 place-items-center rounded-full bg-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.2),0px_4px_6px_0px_rgba(0,0,0,0.12)]">
        <FileCheck className="size-7 text-[#E6757D]" />
      </div>

      {/*Row containing registration date details*/}
      <div className="grid grid-cols-1 gap-10 pr-20 md:grid-cols-3">
        <div className="space-y-8 mt-4">
          <Field label="Registration Number">
            <div className="text-3xl font-semibold tracking-tight">{registrationNumber}</div>
          </Field>
          <Field label="Status">{registrationStatus}</Field>
        </div>

        <div className="space-y-8 mt-4">
          <Field label="Expiration Date">{formatLongDate(registrationDate)}</Field>
          <Field label="Registration Date">{formatLongDate(registrationDate)}</Field>
        </div>
      </div>

      <div className="mt-10 h-px w-full bg-white/25" />

      {/*Row containing owner and vehicle details*/}
      <div className="grid grid-cols-1 gap-10 pr-20 md:grid-cols-3">
        <div className="space-y-1 mt-8">
          <Field label="Registered Vehicle">{vehiclePlate}</Field>
          {vehicleSub ? <div className="mt-1 text-sm font-medium text-white/75">{vehicleSub}</div> : null}
        </div>

        <div className="space-y-1 mt-8">
          <Field label="Registered Owner">{ownerName}</Field>
          <div className="mt-1 text-sm font-medium text-white/75">{ownerLicense}</div>
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
