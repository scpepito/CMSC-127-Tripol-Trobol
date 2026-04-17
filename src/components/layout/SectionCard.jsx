import { cn } from '../../lib/cn.js'

export default function SectionCard({
  title,
  icon,
  action,
  children,
  className,
}) {
  return (
    <section
      className={cn(
        'overflow-visible rounded-[14px] border border-[#b7b3ff] bg-white shadow-sm',
        className,
      )}
    >
      <div className="flex items-center rounded-tl-[14px] rounded-tr-[14px] justify-between gap-4 border-b border-slate-200 bg-[#f4f6fe] px-6 py-4">
        <div className="flex items-center gap-3">
          {icon ? (
            <span className="grid size-7 place-items-center rounded-[10px] bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
              {icon}
            </span>
          ) : null}
          <h2 className="text-m font-bold text-[#5B5296]">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  )
}
