/**
 * Centered dialog for full and final settlement with earnings, deductions, and timeline.
 * Opened from FinalSettlementTab when creating or editing a settlement.
 */

import { useEffect } from 'react'

import { SETTLEMENT_CA_NOTICE } from '../../constants/variablePayLabels'
import { useEmployeeLookup } from '../../hooks/useEmployeeLookup'
import { usePayroll } from '../../hooks/usePayroll'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import { useSettlementEditor } from '../../hooks/useSettlementEditor'
import type { FinalSettlement } from '../../types/finalSettlement'
import { getOpenSettlementEmployeeIds } from '../../utils/employeeExit'
import { buildAutoSettlementLines } from '../../utils/computeSettlementLines'
import { ApprovalStatusPill } from '../ApprovalStatusPill'
import {
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '../shared/PayrollDialog'
import { SettlementDialogScrollBody } from './SettlementDialogScrollBody'
import { SettlementPanelFooter } from './SettlementPanelFooter'

type SettlementDetailPanelProps = {
  settlement: FinalSettlement | null
  open: boolean
  isUnsaved: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: FinalSettlement) => void
  onDiscard: () => void
}

export function SettlementDetailPanel(props: SettlementDetailPanelProps) {
  const { rawEmployees, settlements, settings, structures, updateSettlementStatus } = usePayroll()
  const { showToast } = usePayrollToast()
  const nameFor = useEmployeeLookup()
  const editor = useSettlementEditor(props.settlement)
  const draft = editor.draft
  const employee = rawEmployees.find((item) => item.id === draft?.employeeId)
  const structure = structures.find((item) => item.employeeId === draft?.employeeId)
  const pickEmployees = rawEmployees.filter(
    (item) =>
      item.id === draft?.employeeId ||
      !getOpenSettlementEmployeeIds(settlements).has(item.id),
  )

  function runRecalculate() {
    if (!draft || !employee || !structure) {
      return
    }
    const auto = buildAutoSettlementLines(employee, settings, structure, draft)
    editor.applyAutoRecalc(auto.earnings, auto.deductions)
  }

  function patchExit(patch: Partial<FinalSettlement>) {
    editor.patchExit(patch)
    window.setTimeout(runRecalculate, 0)
  }

  useEffect(() => {
    if (props.open && draft?.status === 'Draft' && draft.earningsLines.length === 0) {
      runRecalculate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, draft?.id])

  if (!draft) {
    return null
  }

  const readOnly = draft.status !== 'Draft'
  const canSubmit =
    !editor.dateError &&
    draft.earningsLines.some((line) => !line.infoOnly && line.amount > 0) &&
    draft.netPayable > 0

  function handleOpenChange(open: boolean) {
    if (!open && props.isUnsaved) {
      props.onDiscard()
    }
    props.onOpenChange(open)
  }

  return (
    <PayrollDialogRoot open={props.open} onOpenChange={handleOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent size="md" aria-describedby="settlement-dialog-desc">
          <PayrollDialogHeader
            title="Full & final settlement"
            description={SETTLEMENT_CA_NOTICE}
            descriptionId="settlement-dialog-desc"
          >
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ApprovalStatusPill status={draft.status} />
              <span className="text-sm text-hrms-text-secondary">
                {nameFor(draft.employeeId)} · {draft.employeeId}
              </span>
            </div>
          </PayrollDialogHeader>
          <SettlementDialogScrollBody
            draft={draft}
            readOnly={readOnly}
            dateError={editor.dateError ?? null}
            pickEmployees={pickEmployees}
            editor={editor}
            onPatch={patchExit}
            onRecalculate={runRecalculate}
          />
          <PayrollDialogFooter className="shadow-[0_-6px_16px_rgba(23,33,58,0.06)]">
            <SettlementPanelFooter
              draft={draft}
              readOnly={readOnly}
              canSubmit={canSubmit}
              onSave={() => props.onSave(draft)}
              onSubmit={() =>
                void updateSettlementStatus(draft.id, 'Pending approval').then(() => showToast('Submitted.'))
              }
              onDiscard={() => {
                props.onDiscard()
                props.onOpenChange(false)
              }}
              onApprove={() => void updateSettlementStatus(draft.id, 'Approved').then(() => showToast('Approved.'))}
              onReject={() => {
                const reason = window.prompt('Rejection reason (required)')
                if (reason?.trim()) {
                  void updateSettlementStatus(draft.id, 'Rejected', reason.trim())
                }
              }}
              onPaid={() => void updateSettlementStatus(draft.id, 'Paid').then(() => showToast('Marked paid.'))}
              onDownload={() => showToast('Settlement statement download will be available with the API.')}
            />
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}
