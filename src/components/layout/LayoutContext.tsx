import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/** Desktop sidebar widths — keep MainLayout padding in sync with Sidebar. */
export const SIDEBAR_WIDTH_EXPANDED_PX = 260
export const SIDEBAR_WIDTH_COLLAPSED_PX = 84

type LayoutContextValue = {
  collapsed: boolean
  mobileOpen: boolean
  sidebarWidthPx: number
  toggleCollapsed: () => void
  setCollapsed: (value: boolean) => void
  setMobileOpen: (value: boolean) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      if (media.matches) setMobileOpen(false)
      if (!media.matches) setCollapsed(false)
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const sidebarWidthPx = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED_PX
    : SIDEBAR_WIDTH_EXPANDED_PX

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      sidebarWidthPx,
      toggleCollapsed,
      setCollapsed,
      setMobileOpen,
    }),
    [collapsed, mobileOpen, sidebarWidthPx, toggleCollapsed],
  )

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}
