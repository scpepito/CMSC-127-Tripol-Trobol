import { cn } from '../../lib/cn.js'

export default function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}) {
  return (
    <label className={cn('block', className)}>
      {label ? (
        <div className="mb-2 text-xs font-semibold text-slate-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      ) : hint ? (
        <div className="mt-2 text-xs text-slate-500">{hint}</div>
      ) : null}
    </label>
  )
}

