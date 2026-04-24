import { cn } from '../../lib/cn.js'

export default function SectionCard({
  title,
  icon,
  action,
  accent = 'violet',
  children,
  className,
}) {
  const accents = {
    violet: {
      border: 'border-[#b7b3ff]',
      headerBg: 'bg-[#f4f6fe]',
      title: 'text-[#5B5296]',
    },
    pink: {
      border: 'border-[#cf89d4]',
      headerBg: 'bg-[#fbf3fd]',
      title: 'text-[#bf68c5]',
    },
    orange: {
      border: 'border-[#E6757D]',
      headerBg: 'bg-[#FEF4F4]',
      title: 'text-[#E86668]',
    }
  }
  const a = accents[accent] ?? accents.violet

  return (
    <section
      className={cn(
        'overflow-visible rounded-[14px] border bg-white shadow-sm',
        a.border,
        className,
      )}
    >
      <div className={cn('flex items-center rounded-tl-[14px] rounded-tr-[14px] justify-between gap-4 border-b border-slate-200 px-6 py-4', a.headerBg)}>
        <div className="flex items-center gap-3">
          {icon ? (
            <span className="grid size-7 place-items-center rounded-[10px] bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
              {icon}
            </span>
          ) : null}
          <h2 className={cn('text-m font-bold', a.title)}>{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  )
}
