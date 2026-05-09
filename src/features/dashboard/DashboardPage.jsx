import { ChevronRight, CircleAlert } from 'lucide-react'
import { AppFrame, PageHeader } from '../../components/index.js'
import { cn } from '../../lib/cn.js'

function IconShadowLine() {
  return (
    <div
      className="absolute left-2 top-29 h-1 w-28"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(6, 6, 7, 0.143) 7.1429%, rgba(31, 33, 36, 0.286) 14.286%, rgba(61, 65, 69, 0.429) 21.429%, rgba(94, 99, 105, 0.571) 28.571%, rgba(128, 135, 143, 0.714) 35.714%, rgba(165, 173, 183, 0.857) 42.857%, rgb(203, 213, 225) 50%, rgba(165, 173, 183, 0.857) 57.143%, rgba(128, 135, 143, 0.714) 64.286%, rgba(94, 99, 105, 0.571) 71.429%, rgba(61, 65, 69, 0.429) 78.571%, rgba(31, 33, 36, 0.286) 85.714%, rgba(6, 6, 7, 0.143) 92.857%, rgba(0, 0, 0, 0) 100%)',
      }}
      aria-hidden
    />
  )
}

function DashboardIllustration({ variant }) {
  const tones = {
    drivers: { dot: 'bg-[#8a7cd1]', outline: 'border-[#8a7cd1]' },
    vehicles: { dot: 'bg-[#d06ad9]', outline: 'border-[#d06ad9]' },
    registry: { dot: 'bg-[#f07b8e]', outline: 'border-[#f07b8e]' },
    violations: { dot: 'bg-[#9ac46b]', outline: 'border-[#9ac46b]' },
  }
  const t = tones[variant] ?? tones.drivers

  return (
    <div className="relative h-28 w-32">
      <div className={cn('absolute left-0 top-2 size-2 rounded-full', t.dot)} aria-hidden />
      <div className={cn('absolute left-4 top-21 size-3 rounded-full border-2', t.outline)} aria-hidden />
      <IconShadowLine />

      <svg
        viewBox="0 0 128 112"
        className="absolute left-0 top-0 h-28 w-32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {variant === 'drivers' ? (
          <>
            <rect x="25" y="24" width="80" height="64" rx="10" stroke="#202244" strokeWidth="3" />
            <circle cx="45" cy="40" r="10" stroke="#202244" strokeWidth="3" />
            <path d="M41 60H89" stroke="#202244" strokeWidth="3" strokeLinecap="round" />
            <path d="M41 70H78" stroke="#202244" strokeWidth="3" strokeLinecap="round" />
            <rect x="10" y="56" width="32" height="40" rx="10" stroke="#202244" strokeWidth="3" />
            <path d="M19 72H33" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : null}

        {variant === 'vehicles' ? (
          <>
            <path d="M34 70V54c0-9 7-16 16-16h28c9 0 16 7 16 16v16" stroke="#202244" strokeWidth="3" strokeLinecap="round" />
            <path d="M34 70h76" stroke="#202244" strokeWidth="3" strokeLinecap="round" />
            <circle cx="48" cy="74" r="8" stroke="#202244" strokeWidth="3" />
            <circle cx="96" cy="74" r="8" stroke="#202244" strokeWidth="3" />
            <path d="M44 38h56" stroke="#202244" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : null}

        {variant === 'registry' ? (
          <>
            <rect x="34" y="20" width="60" height="78" rx="10" stroke="#202244" strokeWidth="3" />
            <rect x="52" y="12" width="24" height="14" rx="6" stroke="#202244" strokeWidth="3" />
            <path d="M46 44h36" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            <path d="M46 60h28" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : null}

        {variant === 'violations' ? (
          <>
            <rect x="34" y="20" width="60" height="78" rx="10" stroke="#202244" strokeWidth="3" />
            <rect x="52" y="12" width="24" height="14" rx="6" stroke="#202244" strokeWidth="3" />
            <path d="M46 46h32" stroke="#9AC46B" strokeWidth="6" strokeLinecap="round" />
            <path d="M46 62h28" stroke="#9AC46B" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : null}
      </svg>
    </div>
  )
}

function DashboardCard({
  title,
  description,
  illustration,
  tone = 'violet',
  onClick,
}) {
  const tones = {
    drivers: { bg: 'bg-[#f4f6fe]', border: 'border-[#e0e6ff]', arrow: 'bg-[#8a7cd1]' },
    vehicles: { bg: 'bg-[#faf5ff]', border: 'border-[#f0d9ff]', arrow: 'bg-[#d06ad9]' },
    registry: { bg: 'bg-[#fff1f2]', border: 'border-[#ffd7dc]', arrow: 'bg-[#f07b8e]' },
    violations: { bg: 'bg-[#f0fdf4]', border: 'border-[#d9f99d]', arrow: 'bg-[#9ac46b]' },
  }

  const t = tones[tone] ?? tones.drivers

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[clamp(140px,18vh,160px)] w-full items-center justify-between gap-4 rounded-2xl border pl-6.25 pr-10.25 py-6 text-left',
        'shadow-[5px_5px_7px_0px_rgba(0,0,0,0.05)]',
        t.bg,
        t.border,
        'enabled:cursor-pointer enabled:hover:shadow-[6px_6px_10px_0px_rgba(0,0,0,0.06)]',
      )}
    >
      <div className="flex min-w-0 items-center gap-5">
        <div className="shrink-0">{illustration}</div>
        <div className="min-w-0">
          <div className="text-[24px] font-bold leading-7.5 text-[#202244]">{title}</div>
          <div className="mt-1 max-w-62 text-[14px] leading-4.25 text-[#8487a8]">{description}</div>
        </div>
      </div>

      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-full text-white shadow-sm',
          t.arrow,
        )}
        aria-hidden
      >
        <ChevronRight className="size-5" />
      </span>
    </button>
  )
}

function AlertRow({ tone = 'warning', children, onClick }) {
  const tones = {
    warning: { bg: 'bg-[#fefce8]', border: 'border-[#fde68a]' },
    danger: { bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]' },
    info: { bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]' },
  }
  const t = tones[tone] ?? tones.warning

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-13.5 w-full items-center justify-between gap-4 rounded-2xl border px-4.25 text-left',
        t.bg,
        t.border,
        'enabled:cursor-pointer enabled:hover:brightness-[0.99]',
      )}
    >
      <div className="min-w-0 truncate text-[13px] text-[#111827]">{children}</div>
      <div className="flex shrink-0 items-center gap-1 text-[13px] text-[#111827]">
        <span>View</span>
        <span aria-hidden>→</span>
      </div>
    </button>
  )
}

export default function DashboardPage({ onNavigate }) {
  return (
    <AppFrame activeKey="dashboard" onNavigate={onNavigate}>
      <div className="-mx-6 -my-6 h[calc(100vh-61px)] overflow-hidden">
        <div
          className="h-full rounded-none px-[clamp(16px,2.5vh,24px)] py-[clamp(16px,2.5vh,24px)]"
          style={{
            backgroundImage:
              "linear-gradient(148.57533439194958deg, rgb(249, 250, 251) 0%, rgba(250, 245, 255, 0.3) 50%, rgba(239, 246, 255, 0.3) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
          }}
        >
          <div className="m-4.5 flex h-full max-w-300 flex-col">
            <div className="">
              <PageHeader
                title="Dashboard"
                subtitle="Information Management System Dashboard"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-[clamp(16px,3.5vh,28px)] md:grid-cols-2">
              <DashboardCard
                tone="drivers"
                title="Driver Management"
                description="Add, update, search driver records, and manage license information."
                illustration={<DashboardIllustration variant="drivers" />}
                onClick={() => onNavigate?.('drivers')}
              />
              <DashboardCard
                tone="vehicles"
                title="Vehicle Management"
                description="Add, update, search vehicle records, and manage license information."
                illustration={<DashboardIllustration variant="vehicles" />}
                onClick={() => onNavigate?.('vehicles')}
              />
              <DashboardCard
                tone="registry"
                title="Vehicle Registry"
                description="Record vehicle registrations and renewals."
                illustration={<DashboardIllustration variant="registry" />}
                onClick={() => onNavigate?.('registrations')}
              />
              <DashboardCard
                tone="violations"
                title="Traffic Violations"
                description="Record traffic violations committed by drivers."
                illustration={<DashboardIllustration variant="violations" />}
                onClick={() => onNavigate?.('violations')}
              />
            </div>

          </div>
        </div>
      </div>
    </AppFrame>
  )
}
