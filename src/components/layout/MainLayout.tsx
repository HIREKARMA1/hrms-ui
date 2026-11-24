import { Outlet } from 'react-router-dom'

import type { CSSProperties } from 'react'

import { LeaveViewerProvider } from '@/features/leave/context/LeaveViewerProvider'

import { Header } from './Header'
import { LayoutProvider, useLayout } from './LayoutContext'
import { Sidebar } from './Sidebar'

function MainLayoutShell() {
  const { sidebarWidthPx } = useLayout()

  return (
    <div
      className="min-h-svh bg-app-bg transition-[--app-sidebar-width] duration-300 ease-in-out will-change-[padding]"
      style={
        {
          '--app-sidebar-width': `${sidebarWidthPx}px`,
        } as CSSProperties
      }
    >
      <Sidebar />
      <div className="flex min-h-svh flex-col lg:pl-[var(--app-sidebar-width)]">
        <Header />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function MainLayout() {
  return (
    <LayoutProvider>
      <LeaveViewerProvider>
        <MainLayoutShell />
      </LeaveViewerProvider>
    </LayoutProvider>
  )
}
