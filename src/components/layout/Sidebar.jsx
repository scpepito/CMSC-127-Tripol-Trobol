import { cn } from '../../lib/cn.js'

function Brand({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="grid size-10 place-items-center rounded-[14px] border border-blue-500 shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]">
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold leading-7 text-slate-900">{title}</div>
        <div className="text-xs leading-4 text-slate-500">{subtitle}</div>
      </div>
    </div>
  )
}

function Footer({ line1, line2 }) {
  return (
    <div className="border-t border-slate-100 px-6 py-5 text-xs text-slate-500">
      <div className="font-medium">{line1}</div>
      <div className="mt-1">{line2}</div>
    </div>
  )
}

function NavLink({ active, icon, children, href, onClick }) {
  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-[14px] py-3 pl-4 pr-4 text-left text-[16px] leading-6',
        href ? 'cursor-pointer' : 'cursor-pointer',
        active
          ? 'border border-black/10 bg-white text-blue-500 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]'
          : 'text-slate-600 hover:bg-slate-50',
      )}
      type={href ? undefined : 'button'}
    >
      {active ? (
        <span className="absolute left-0 h-full w-3.5 rounded-tl-[1800px] rounded-bl-[1800px] bg-blue-500 shadow-[2px_0px_12px_0px_rgba(255,255,255,0.4)]" />
      ) : null}
      <span className={cn('grid size-5 place-items-center', active ? 'ml-3' : '')}>
        {icon}
      </span>
      <span className={cn('font-medium', active ? 'text-blue-500' : '')}>
        {children}
      </span>
    </Tag>
  )
}

export default function Sidebar({
  brand,
  links,
  footer,
  activeKey,
  className,
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <div className="border-b border-slate-100">
        <Brand
          icon={brand?.icon}
          title={brand?.title}
          subtitle={brand?.subtitle}
        />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
        {links?.map((link) => (
          <NavLink
            key={link.key}
            active={link.key === activeKey}
            icon={link.icon}
            href={link.href}
            onClick={link.onClick}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      {footer ? <Footer line1={footer.line1} line2={footer.line2} /> : null}
    </div>
  )
}
