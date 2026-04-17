import { cn } from '../../lib/cn.js'

export default function PageHeader({
  leading,
  title,
  subtitle,
  action,
  className,
}) {
  return (
    <div className={cn('flex items-start justify-between gap-6', className)}>
      <div className="flex min-w-0 items-start gap-4">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
