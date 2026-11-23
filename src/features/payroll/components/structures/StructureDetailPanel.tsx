/**
 * Centered dialog to edit a salary structure and view revision history.
 */

import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { usePayroll } from '../../hooks/usePayroll'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import {
  STRUCTURE_PANEL_TABS,
  useStructurePanelTabs,
  type StructurePanelTabId,
} from '../../hooks/useStructurePanelTabs'
import type { SalaryStructure } from '../../types/salaryStructure'
import { computeStructurePreview } from '../../utils/computeStructurePreview'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '../shared/PayrollDialog'
import { RevisionHistoryTab } from './RevisionHistoryTab'
import { StructureEditorTab } from './StructureEditorTab'

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
    if (!draft) return null
    return computeStructurePreview(settings, draft, payrollMonth)
  }, [draft, settings, payrollMonth])

  const open = Boolean(structure && draft && preview)

  async function handleSave() {
    if (!draft || reason.trim().length === 0) return
    await saveSalaryStructure(draft, reason.trim())
    showToast('Salary structure revision saved.')
    setReason('')
    onClose()
  }

  function handleOpenChange(next: boolean) {
    if (!next) onClose()
  }

  if (!structure || !draft || !preview) {
    return null
  }

  return (
    <PayrollDialogRoot open={open} onOpenChange={handleOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent size="md" className="flex max-h-[min(90vh,720px)] flex-col p-0">
          <PayrollDialogHeader
            title={draft.employeeName}
            description={`${draft.id} · ${draft.department}`}
          />
          <div
            role="tablist"
            aria-label="Structure sections"
            className="flex shrink-0 gap-2 border-b border-hrms-border px-6 py-3"
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
                    : 'text-hrms-text-secondary hover:text-hrms-navy',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <PayrollDialogBody className="space-y-5">
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
              <RevisionHistoryTab employeeId={draft.employeeId} loadRevisions={fetchRevisions} />
            )}
          </PayrollDialogBody>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}