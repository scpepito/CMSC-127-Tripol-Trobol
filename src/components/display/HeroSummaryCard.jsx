import { cn } from '../../lib/cn.js'

export default function HeroSummaryCard({
  title,
  subtitle,
  badge,
  items,
  right,
  className,
}) {
  return (
    <section
      className={cn(
        'rounded-[14px] bg-[#8981d2] px-6 py-6 text-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{title}</h2>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
          {subtitle ? <p className="mt-1 text-sm/5 text-white/80">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {items?.length ? (
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.key} className="min-w-0">
              <div className="text-xs font-semibold text-white/70">{item.label}</div>
              <div className="mt-1 truncate text-sm font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

