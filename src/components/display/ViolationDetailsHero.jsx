import { TriangleAlert, Landmark } from 'lucide-react'
import { cn } from '../../lib/cn.js'

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

export default function ViolationDetailsHero({
  violationId,
  violationType,
  violationStatus,
  date,
  apprehendingOfficer,
  violationFine,
  addressLine1,
  addressLine2,
  driverName,
  driverLicense,
  vehicleName,
  vehicleSub,
  footer = 'Land Transportation Office',
  className,
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl bg-linear-to-bl from-[#3EC191] to-[#63CAA3] px-10 py-9 text-white',
        'shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] ring-1 ring-[#3EC191] border-3 border-[#3EC191]',
        'transition-all hover:shadow-xl hover:scale-[1.02]',
        className,
      )}
    >
      <div className="absolute right-10 top-9 grid size-16 place-items-center rounded-full bg-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.2),0px_4px_6px_0px_rgba(0,0,0,0.12)]">
        <TriangleAlert className="size-7 text-[#3EC191]" />
      </div>

      <div className="grid grid-cols-1 gap-10 pr-20 md:grid-cols-2">
        <div className="space-y-8 mt-4">
          <Field label="Ticket Number">
            <div className="text-3xl font-semibold tracking-tight">{violationId}</div>
          </Field>

          <Field label="Violation">           
             <div className="text-2xl font-semibold tracking-tight">{violationType}</div>
          </Field>


          <Field label="Violation Date">{date}</Field>
          <Field label="Addresss">{addressLine1}<br/>{addressLine2}</Field>

        </div>

        <div className="space-y-8 mt-4">
          <Field label="Fine Amount">
            <div className="text-3xl font-semibold tracking-tight">₱{violationFine}</div>
          </Field>

          {apprehendingOfficer && (
            <Field label="Apprehending Officer">
              <div className="text-2xl font-semibold tracking-tight">
                {apprehendingOfficer}
              </div>
            </Field>
          )}

          <Field label="Status">{violationStatus}</Field>


        </div>

      </div>



      <div className="mt-10 h-px w-full bg-white/25" />
      
      <div className="grid grid-cols-1 gap-10 pr-20 md:grid-cols-3">
        <Field label="Driver" className="mt-6">
          <div  className="space-y-1">
              <div className="text-2xl font-semibold tracking-tight">{driverName}</div>
            <div className="mt-1 text-sm font-medium text-white/75">{driverLicense}</div>
          </div>
        </Field>

        <Field label="Vehicle" className="mt-6">
          <div className='-space-y-1'>
            <div className="text-2xl font-semibold tracking-tight">{vehicleName}</div>
            {vehicleSub ? <div className="mt-1 text-sm font-medium text-white/75">{vehicleSub}</div> : null}
          </div>
        </Field>
      </div>


      <div className="mt-10 h-px w-full bg-white/25" />



      <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
        <Landmark className="size-4 text-white/70" />
        <span>{footer}</span>
      </div>


    </section>
  )
}
