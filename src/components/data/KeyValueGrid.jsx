import { cn } from '../../lib/cn.js'

export default function KeyValueGrid({ items, columns = 4, className }) {
  const gridCols =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-3'
        : 'grid-cols-4'

  return (
    <dl className={cn('grid gap-6', gridCols, className)}>
      {items.map((item) => (
        <div key={item.key} className="min-w-0">
          <dt className="text-xs font-semibold text-slate-500">{item.label}</dt>
          <dd className="mt-1 truncate text-sm font-medium text-slate-900">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

