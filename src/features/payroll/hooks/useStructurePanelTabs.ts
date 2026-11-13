/**
 * Tab state for the salary structure detail panel with arrow keys.
 * Used by StructureDetailPanel.
 */

import { useCallback, useState, type KeyboardEvent } from 'react'

export const STRUCTURE_PANEL_TABS = ['Structure', 'Revision history'] as const

export type StructurePanelTabId = (typeof STRUCTURE_PANEL_TABS)[number]

export function useStructurePanelTabs(initial: StructurePanelTabId = 'Structure') {
  const [activeTab, setActiveTab] = useState<StructurePanelTabId>(initial)

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    const index = STRUCTURE_PANEL_TABS.indexOf(activeTab)
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const next =
        event.key === 'ArrowRight'
          ? STRUCTURE_PANEL_TABS[(index + 1) % STRUCTURE_PANEL_TABS.length]
          : STRUCTURE_PANEL_TABS[(index - 1 + STRUCTURE_PANEL_TABS.length) % STRUCTURE_PANEL_TABS.length]
      setActiveTab(next)
    }
  }, [activeTab])

  return { activeTab, setActiveTab, onKeyDown }
}
