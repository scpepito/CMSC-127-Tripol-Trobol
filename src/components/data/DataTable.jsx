import { cn } from '../../lib/cn.js'

export default function DataTable({
  columns,
  rows,
  getRowKey,
  className,
  rowClassName,
  theadClassName,
}) {
  const keyForRow = getRowKey ?? ((_, index) => index)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[14px] bg-white shadow-sm ring-1 ring-slate-200',
        className,
      )}
    > 
      <table className="w-full table-fixed">
        <thead className={cn('bg-[#f4f6fe]', theadClassName)}>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.6px] text-slate-700',
                  col.align === 'right' ? 'text-right' : '',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={keyForRow(row, index)}
              className={cn('border-b border-slate-200 last:border-b-0', rowClassName)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-6 py-5 align-middle text-[16px] leading-6 text-slate-900',
                    col.align === 'right' ? 'text-right' : '',
                    col.cellClassName,
                  )}
                >
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
