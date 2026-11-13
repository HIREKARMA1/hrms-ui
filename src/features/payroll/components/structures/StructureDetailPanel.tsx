/**
 * Side panel to edit a salary structure and view revision history.
 * Used on SalaryStructuresTab when a table row is selected.
 */

import { useEffect, useMemo, useState } from 'react'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { usePayroll } from '../../hooks/usePayroll'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import {
  STRUCTURE_PANEL_TABS,
  useStructurePanelTabs,
  type StructurePanelTabId,
} from '../../hooks/useStructurePanelTabs'
import type { SalaryStructure } from '../../types/salaryStructure'
import { computeStructurePreview } from '../../utils/computeStructurePreview'
import { cn } from '@/lib/utils'
import { RevisionHistoryTab } from './RevisionHistoryTab'
import { StructureEditorTab } from './StructureEditorTab'

const panelPaddingX = 'px-4 sm:px-6'

type StructureDetailPanelProps = {
  structure: SalaryStructure | null
  onClose: () => void
}

export function StructureDetailPanel({ structure, onClose }: StructureDetailPanelProps) {
  const { settings, payrollMonth, saveSalaryStructure, fetchRevisions } = usePayroll()
  const { showToast } = usePayrollToast()
  const { activeTab, setActiveTab, onKeyDown } = useStructurePanelTabs()
  const [draft, setDraft] = useState<SalaryStructure | null>(structure)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDraft(structure)
      setReason('')
    }, 0)
    return () => window.clearTimeout(handle)
  }, [structure])

  const preview = useMemo(() => {
    if (!draft) {
      return null
    }
    return computeStructurePreview(settings, draft, payrollMonth)
  }, [draft, settings, payrollMonth])

  if (!structure || !draft || !preview) {
    return null
  }

  async function handleSave() {
    if (!draft || reason.trim().length === 0) {
      return
    }
    await saveSalaryStructure(draft, reason.trim())
    showToast('Salary structure revision saved.')
    setReason('')
    onClose()
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-xl [&>button]:top-5 [&>button]:right-4 sm:[&>button]:right-6">
        <header className={`shrink-0 py-5 pr-12 sm:pr-14 ${panelPaddingX}`}>
          <SheetHeader className="space-y-2 text-left">
            <SheetTitle className="text-hrms-navy">{draft.employeeName}</SheetTitle>
            <p className="text-sm text-hrms-text-secondary">
              {draft.id} · {draft.department}
            </p>
          </SheetHeader>
        </header>
        <div
          role="tablist"
          aria-label="Structure panel sections"
          className={`flex gap-2 border-b border-hrms-border pb-2 ${panelPaddingX}`}
        >
          {STRUCTURE_PANEL_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab as StructurePanelTabId)}
              onKeyDown={onKeyDown}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-hrms-focus',
                activeTab === tab
                  ? 'bg-hrms-lavender text-hrms-primary'
                  : 'text-hrms-text-secondary',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-5 ${panelPaddingX}`}>
          {activeTab === 'Structure' ? (
            <StructureEditorTab
              draft={draft}
              settings={settings}
              preview={preview}
              reason={reason}
              onReasonChange={setReason}
              onChange={setDraft}
              onSave={handleSave}
            />
          ) : (
            <RevisionHistoryTab
              employeeId={draft.employeeId}
              loadRevisions={fetchRevisions}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
