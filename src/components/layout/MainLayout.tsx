import { Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { Header } from './Header'
import { LayoutProvider, useLayout } from './LayoutContext'
import { Sidebar } from './Sidebar'

function MainLayoutShell() {
  const { collapsed } = useLayout()

  return (
    <div className="min-h-svh bg-app-bg">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-svh flex-col transition-[padding] duration-200',
          collapsed ? 'lg:pl-[84px]' : 'lg:pl-[260px]',
        )}
      >
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
      <MainLayoutShell />
    </LayoutProvider>
  )
}
