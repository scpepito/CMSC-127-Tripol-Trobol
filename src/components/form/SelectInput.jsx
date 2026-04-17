import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export default function SelectInput({
  leftIcon,
  className,
  selectClassName,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 overflow-hidden rounded-[14px] bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-[#8981d2]',
        className,
      )}
    >
      {leftIcon ? (
        <span className="grid size-5 place-items-center text-slate-400">
          {leftIcon}
        </span>
      ) : null}
      <select
        className={cn(
          'h-6 min-w-0 flex-1 bg-transparent text-[16px] text-slate-900 outline-none',
          selectClassName,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

