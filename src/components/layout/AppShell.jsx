import { cn } from '../../lib/cn.js'

export default function AppShell({ sidebar, topBar, children, className }) {
  return (
    <div className={cn('min-h-screen bg-[#ffffff]', className)}>
      {sidebar ? (
        <aside className="fixed inset-y-0 left-0 z-40 w-64">
          <div className="h-full">{sidebar}</div>
        </aside>
      ) : null}

      {topBar ? (
        <div
          className={cn(
            'fixed top-0 z-30 h-15.25 border-b border-slate-200 bg-white/80 backdrop-blur',
            sidebar ? 'left-64 right-0' : 'left-0 right-0',
          )}
        >
          <div className="mx-auto flex h-full max-w-360 items-center px-6">
            <div className="w-full">{topBar}</div>
          </div>
        </div>
      ) : null}

      <main
        className={cn(
          'min-h-screen',
          sidebar ? 'pl-64' : '',
          topBar ? 'pt-15.25' : '',
        )}
      >
        <div className="mx-auto max-w-360 px-6 py-6">{children}</div>
      </main>
    </div>
  )
}
