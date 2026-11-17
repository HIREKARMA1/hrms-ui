import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { useEffect, useMemo, useState } from 'react'
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

import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'

import { useLayout } from './LayoutContext'
import type { NavItem } from './navigation'
import { resolveNavigationItems } from './resolveNavigation'

const EXACT_ONLY_PATHS = new Set([
  '/dashboard',
  '/attendance',
  '/employees',
  '/superadmin',
  '/admin',
  '/hr',
  '/employee',
  '/superadmin/dashboard',
  '/admin/dashboard',
  '/hr/dashboard',
  '/employee/dashboard',
  '/superadmin/attendance',
  '/admin/attendance',
  '/hr/attendance',
  '/superadmin/employees',
  '/admin/employees',
  '/hr/employees',
  '/employee/attendance',
  '/superadmin/recruitment',
  '/admin/recruitment',
  '/hr/recruitment',
  '/superadmin/leave',
  '/admin/leave',
  '/hr/leave',
  '/superadmin/payroll',
  '/admin/payroll',
  '/hr/payroll',
  '/superadmin/leads',
  '/admin/leads',
  '/hr/leads',
  '/employee/leads',
  '/employee/leave',
  '/employee/payslips',
  '/superadmin/calendar',
  '/admin/calendar',
  '/hr/calendar',
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

  const Icon = item.icon

  const linkClass = (active: boolean) =>
    cn(
      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      active
        ? 'bg-brand-500 text-white shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white',
      collapsed && 'justify-center px-0',
    )

  if (!hasChildren) {
    const content = (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) => linkClass(isActive || parentActive)}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
        {!collapsed ? <span className="truncate">{item.title}</span> : null}
      </NavLink>
    )

    if (!collapsed) return content

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    )
  }

  const trigger = (
    <button
      type="button"
      onClick={() => {
        if (collapsed) return
        setOpen((prev) => !prev)
      }}
      className={linkClass(
        Boolean(parentActive && !childActive) ||
          Boolean(childActive && collapsed),
      )}
      aria-expanded={open}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      {!collapsed ? (
        <>
          <span className="flex-1 truncate text-left">{item.title}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </>
      ) : null}
    </button>
  )

  return (
    <div>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={
                item.children!.find((c) => !c.isSectionLabel)?.path ??
                item.children![0].path
              }
              onClick={onNavigate}
              className={linkClass(Boolean(parentActive))}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      {!collapsed ? (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
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
      ) : null}
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
  const { role } = useLeaveViewer()
  const navigationItems = useMemo(() => resolveNavigationItems(role), [role])
  const isCollapsed = variant === 'desktop' ? collapsed : false
  const items = rbac
    ? toSidebarNavItems(rbac.navigation)
    : navigationItems

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-full flex-col bg-navy text-white',
          variant === 'desktop' &&
            'fixed inset-y-0 left-0 z-30 hidden border-r border-white/5 transition-[width] duration-200 lg:flex',
          variant === 'desktop' && (isCollapsed ? 'w-[84px]' : 'w-[260px]'),
          variant === 'mobile' && 'w-full',
        )}
      >
        <div
          className={cn(
            'flex items-start gap-3 border-b border-white/10 px-4 py-5',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <HireKarmaMark />
          {!isCollapsed ? (
            <div className="min-w-0 pt-0.5">
              <p className="text-base font-bold tracking-tight">HRMS</p>
              <p className="text-[11px] leading-snug text-slate-400">
                {rbac
                  ? `${rbac.roleLabel} workspace`
                  : 'Human Resources Management System'}
              </p>
            </div>
          ) : null}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1.5 pr-2">
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
          <div className="border-t border-white/10 p-3">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'h-10 w-full justify-start gap-3 text-slate-300 hover:bg-white/10 hover:text-white',
                isCollapsed && 'justify-center px-0',
              )}
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        ) : null}
      </aside>
    </TooltipProvider>
  )
}
