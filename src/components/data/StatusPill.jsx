import { cn } from '../../lib/cn.js'

const tones = {
  success: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  danger: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  warning: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
}

export default function StatusPill({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex h-6.5 items-center justify-center rounded-full px-3 text-xs font-medium',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

