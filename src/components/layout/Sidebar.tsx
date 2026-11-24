import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import {
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { resolveNavIcon } from '@/features/rbac/utils/navIcons'

import { useLayout } from './LayoutContext'
import type { NavItem } from './navigation'

const EXACT_ONLY_PATHS = new Set([
  '/dashboard',
  '/attendance',
  '/employees',
  '/superadmin',
  '/hradmin',
  '/manager',
  '/employee',
  '/superadmin/dashboard',
  '/hradmin/dashboard',
  '/manager/dashboard',
  '/employee/dashboard',
  '/superadmin/attendance',
  '/hradmin/attendance',
  '/manager/attendance',
  '/superadmin/employees',
  '/hradmin/employees',
  '/manager/employees',
  '/employee/attendance',
  '/superadmin/recruitment',
  '/hradmin/recruitment',
  '/manager/recruitment',
  '/superadmin/leave',
  '/hradmin/leave',
  '/manager/leave',
  '/superadmin/payroll',
  '/hradmin/payroll',
  '/manager/payroll',
  '/superadmin/leads',
  '/hradmin/leads',
  '/manager/leads',
  '/employee/leads',
  '/employee/leave',
  '/employee/payslips',
  '/superadmin/calendar',
  '/hradmin/calendar',
  '/manager/calendar',
  '/employee/calendar',
])

function isPathActive(pathname: string, path: string) {
  if (pathname === path) return true
  // Keep overview roots exact so nested routes don't highlight the parent leaf.
  if (EXACT_ONLY_PATHS.has(path)) return false
  // Keep overview roots exact so child routes don't highlight the parent leaf.
  if (
    path === '/dashboard' ||
    path === '/attendance' ||
    path === '/employees' ||
    path === '/leave' ||
    path === '/payroll'
  ) {
    return false
  }
  return pathname.startsWith(`${path}/`)
}

function toSidebarNavItems(
  items: {
    title: string
    path: string
    iconName: string
    children?: { title: string; path: string; isSectionLabel?: boolean }[]
  }[],
): NavItem[] {
  return items.map((item) => ({
    title: item.title,
    path: item.path,
    icon: resolveNavIcon(item.iconName),
    children: item.children,
  }))
}

function SidebarLabel({
  collapsed,
  children,
  className,
}: {
  collapsed: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out',
        collapsed ? 'ml-0 max-w-0 opacity-0' : 'max-w-[160px] opacity-100',
        className,
      )}
      aria-hidden={collapsed}
    >
      {children}
    </span>
  )
}

function withTooltip(
  collapsed: boolean,
  label: string,
  node: ReactElement,
) {
  if (!collapsed) return node
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const location = useLocation()
  const hasChildren = Boolean(item.children?.length)
  const childActive =
    item.children?.some(
      (child) =>
        !child.isSectionLabel && isPathActive(location.pathname, child.path),
    ) ?? false
  const parentActive = isPathActive(location.pathname, item.path) || childActive
  const [open, setOpen] = useState(childActive)

  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  // Close nested menus while the rail is collapsed so height eases with width.
  const submenuOpen = open && !collapsed
  const Icon = item.icon

  const linkClass = (active: boolean) =>
    cn(
      'group flex h-10 w-full items-center rounded-xl text-sm font-medium transition-[background-color,color,padding,gap] duration-300 ease-in-out',
      active
        ? 'bg-brand-500 text-white shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white',
      collapsed ? 'justify-center gap-0 px-0' : 'gap-3 px-3',
    )

  if (!hasChildren) {
    const link = (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={linkClass(parentActive)}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
        <SidebarLabel collapsed={collapsed}>{item.title}</SidebarLabel>
      </NavLink>
    )

    return withTooltip(collapsed, item.title, link)
  }

  const firstChildPath =
    item.children!.find((c) => !c.isSectionLabel)?.path ??
    item.children![0].path

  const parentControl = collapsed ? (
    <NavLink
      to={firstChildPath}
      onClick={onNavigate}
      className={linkClass(Boolean(parentActive))}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      <SidebarLabel collapsed={collapsed}>{item.title}</SidebarLabel>
    </NavLink>
  ) : (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className={linkClass(
        Boolean(parentActive && !childActive) ||
          Boolean(childActive && collapsed),
      )}
      aria-expanded={submenuOpen}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      <SidebarLabel collapsed={collapsed} className="flex-1 text-left">
        {item.title}
      </SidebarLabel>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-[transform,opacity,max-width] duration-300 ease-in-out',
          submenuOpen && 'rotate-180',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-4 opacity-100',
        )}
      />
    </button>
  )

  return (
    <div>
      {withTooltip(collapsed, item.title, parentControl)}

      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
          submenuOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-3">
            {item.children?.map((child) =>
              child.isSectionLabel ? (
                <li key={`${child.title}-label`} className="pt-2 first:pt-0">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {child.title}
                  </p>
                </li>
              ) : (
                <li key={child.path + child.title}>
                  <NavLink
                    to={child.path}
                    end={EXACT_ONLY_PATHS.has(child.path)}
                    onClick={onNavigate}
                    className={() =>
                      cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        isPathActive(location.pathname, child.path)
                          ? 'bg-white/15 font-medium text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    {child.title}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

type SidebarProps = {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export function Sidebar({ variant = 'desktop', onNavigate }: SidebarProps) {
  const { collapsed, toggleCollapsed } = useLayout()
  const rbac = useOptionalRbacSession()
  const isCollapsed = variant === 'desktop' ? collapsed : false
  // Fail closed: without an authenticated RBAC session there is no menu at all
  // (never fall back to a static, role-agnostic menu).
  const items = rbac ? toSidebarNavItems(rbac.navigation) : []

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-full min-w-0 flex-col overflow-hidden bg-navy text-white',
          variant === 'desktop' &&
            'fixed inset-y-0 left-0 z-30 hidden w-[var(--app-sidebar-width)] border-r border-white/5 transition-[width] duration-300 ease-in-out will-change-[width] lg:flex',
          variant === 'mobile' && 'w-full',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center gap-3 border-b border-white/10 py-5 transition-[padding] duration-300 ease-in-out',
            isCollapsed ? 'justify-center px-2' : 'px-4',
          )}
        >
          <HireKarmaMark size={isCollapsed ? 'sm' : 'md'} />
          <div
            className={cn(
              'min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-in-out',
              isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100',
            )}
            aria-hidden={isCollapsed}
          >
            <p className="text-base font-bold tracking-tight">HRMS</p>
            <p className="text-[11px] leading-snug text-slate-400">
              {rbac
                ? `${rbac.roleLabel} workspace`
                : 'Human Resources Management System'}
            </p>
          </div>
        </div>

        <ScrollArea className="min-w-0 flex-1 px-2 py-4">
          <nav className="space-y-1.5">
            {items.map((item) => (
              <SidebarNavItem
                key={`${item.path}-${item.title}`}
                item={item}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        </ScrollArea>

        {variant === 'desktop' ? (
          <div className="shrink-0 border-t border-white/10 p-2">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'h-10 w-full gap-3 text-slate-300 transition-[padding,gap] duration-300 ease-in-out hover:bg-white/10 hover:text-white',
                isCollapsed ? 'justify-center px-0' : 'justify-start px-3',
              )}
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 shrink-0" />
              ) : (
                <PanelLeftClose className="h-4 w-4 shrink-0" />
              )}
              <SidebarLabel collapsed={isCollapsed}>Collapse</SidebarLabel>
            </Button>
          </div>
        ) : null}
      </aside>
    </TooltipProvider>
  )
}
