import { cn } from '../../lib/cn.js'

export default function IconButton({ label, children, className, ...props }) {
  return (
    <button
      className={cn(
        'grid size-8 place-items-center rounded-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        className,
      )}
      type="button"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  )
}

