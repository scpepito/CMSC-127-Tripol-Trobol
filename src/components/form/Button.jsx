import { cn } from '../../lib/cn.js'

const variants = {
  primary:
    'bg-[#8981d2] text-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] hover:bg-[#7d75c6]',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  className,
  ...props
}) {
  const sizeClass =
    size === 'sm'
      ? 'h-9 px-4 text-sm'
      : size === 'lg'
        ? 'h-12 px-6 text-base'
        : 'h-11 px-5 text-sm'

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        sizeClass,
        variants[variant] ?? variants.primary,
        className,
      )}
      type="button"
      {...props}
    >
      {leftIcon ? <span className="grid size-5 place-items-center">{leftIcon}</span> : null}
      <span>{props.children}</span>
    </button>
  )
}

