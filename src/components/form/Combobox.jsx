import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export default function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  leftIcon,
  searchable = true,
  searchPlaceholder = 'Search...',
  disabled,
  className,
  inputClassName,
  emptyText = 'No results',
}) {
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    const hit = options?.find((o) => o.value === value)
    return hit?.selectedLabel ?? hit?.label ?? String(value)
  }, [options, value])

  const filtered = useMemo(() => {
    if (!searchable) return options ?? []
    const q = query.trim().toLowerCase()
    if (!q) return options ?? []
    return (options ?? []).filter((o) => {
      const label = String(o.label ?? '').toLowerCase()
      const val = String(o.value ?? '').toLowerCase()
      return label.includes(q) || val.includes(q)
    })
  }, [options, query, searchable])

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!open) return
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  function openDropdown() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    if (searchable) queueMicrotask(() => inputRef.current?.focus())
  }

  function selectOption(opt) {
    onChange?.(opt.value)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={cn(
          'flex w-full items-center gap-3 overflow-hidden rounded-[14px] bg-white px-4 py-2.5 text-left shadow-sm ring-1 ring-slate-200 transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8981d2]',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span className="grid size-5 shrink-0 place-items-center text-slate-400">
          {leftIcon ?? <Search className="size-5" />}
        </span>
        <span className={cn('min-w-0 flex-1 truncate text-[16px]', value ? 'text-slate-900' : 'text-black/50')}>
          {value ? selectedLabel : placeholder}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', open ? 'rotate-180' : '')} />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[14px] bg-white shadow-lg ring-1 ring-slate-200">
          {searchable ? (
            <div className="border-b border-slate-100 p-2">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <Search className="size-4 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'h-5 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400',
                    inputClassName,
                  )}
                />
              </div>
            </div>
          ) : null}

          <div className="max-h-64 overflow-auto py-1">
            {filtered.length ? (
              filtered.map((opt) => {
                const active = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectOption(opt)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-sm',
                      active ? 'bg-[#f4f6fe] text-slate-900' : 'hover:bg-slate-50',
                    )}
                  >
                    <span className="grid size-5 shrink-0 place-items-center">
                      {active ? <Check className="size-4 text-[#8981d2]" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{opt.label}</span>
                      {opt.description ? (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {opt.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">{emptyText}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
