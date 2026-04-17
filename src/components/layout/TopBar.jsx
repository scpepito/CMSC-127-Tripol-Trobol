import { cn } from '../../lib/cn.js'

export default function TopBar({ title, right, className }) {
  return (
    <header className={cn('flex items-center justify-between', className)}>
      <div className="text-sm font-medium text-slate-900">{title}</div>
      <div className="text-xs font-medium text-slate-600">{right}</div>
    </header>
  )
}

