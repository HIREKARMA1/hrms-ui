/**
 * Two-column Apply for leave dialog with validation preview and summary panel.
 */

import { CalendarPlus } from 'lucide-react'

import type { LeaveEmployee } from '../../types/employee'
import type { LeaveSettings } from '../../types/leaveSettings'
import type { LedgerEntry } from '../../types/ledger'
import type { HalfDayPortion, LeaveRequest } from '../../types/leaveRequest'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { ApplyLeaveFormColumn } from './ApplyLeaveFormColumn'
import { ApplyLeaveSummaryPanel } from './ApplyLeaveSummaryPanel'
import { OnBehalfDialogFooterBar, OnBehalfDialogShell } from './onBehalf/OnBehalfDialogShell'
import { OnBehalfEmployeeSection } from './onBehalf/OnBehalfEmployeeSection'
import { OnBehalfLeaveForm } from './onBehalf/OnBehalfLeaveForm'
import { OnBehalfSummaryPanel } from './onBehalf/OnBehalfSummaryPanel'
import { useApplyLeaveDialogState } from './useApplyLeaveDialogState'

type ApplyLeaveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: LeaveEmployee
  settings: LeaveSettings
  ledger: LedgerEntry[]
  existing: LeaveRequest[]
  employees: LeaveEmployee[]
  saving?: boolean
  submitterName?: string
  /** Server balances (code → available days, null while unknown). Omit to use the demo ledger. */
  serverBalances?: Record<string, number> | null
  /** Resolve `false` to keep the dialog open with its input (e.g. the server rejected the request). */
  onSubmit: (input: ApplyLeaveSubmitInput) => ApplyLeaveSubmitOutcome
  hrEmployeePicker?: {
    options: LeaveEmployee[]
    value: string
    onChange: (employeeId: string) => void
  }
}

export type ApplyLeaveSubmitInput = {
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  attachmentName?: string
  convertExtraToLwp?: boolean
  portion?: HalfDayPortion
}

export type ApplyLeaveSubmitOutcome = void | boolean | Promise<void | boolean>

export function ApplyLeaveDialog(props: ApplyLeaveDialogProps) {
  const { open, onOpenChange, employee, settings, ledger, existing, employees, saving, onSubmit, hrEmployeePicker, submitterName, serverBalances } =
    props
  const onBehalf = Boolean(hrEmployeePicker)
  const state = useApplyLeaveDialogState(employee, settings, ledger, existing, employees, serverBalances)

  const handleOpenChange = (next: boolean) => {
    if (!next) state.reset()
    onOpenChange(next)
  }

  const handlePrimary = async () => {
    const outcome = await onSubmit(state.submitPayload)
    if (outcome === false) return
    state.reset()
    onOpenChange(false)
  }

  const primaryDisabled = !state.preview || state.preview.errors.length > 0 || !state.reason.trim()

  if (onBehalf && hrEmployeePicker) {
    const formProps = {
      settings,
      balanceFor: state.balanceFor,
      policy: state.policy,
      preview: state.preview,
      leaveTypeCode: state.leaveTypeCode,
      setLeaveTypeCode: state.setLeaveTypeCode,
      fromDate: state.fromDate,
      setFromDate: state.setFromDate,
      toDate: state.toDate,
      setToDate: state.setToDate,
      portion: state.portion,
      setPortion: state.setPortion,
      halfDayAvailable: state.halfDayAvailable,
      reason: state.reason,
      setReason: state.setReason,
      attachmentName: state.attachmentName,
      setAttachmentName: state.setAttachmentName,
      convertLwp: state.convertLwp,
      setConvertLwp: state.setConvertLwp,
      touched: state.touched,
      setTouched: state.setTouched,
    }

    return (
      <OnBehalfDialogShell
        open={open}
        onOpenChange={handleOpenChange}
        describedBy="apply-leave-subtitle"
        footer={
          <OnBehalfDialogFooterBar
            showReasonHint={!state.reason.trim()}
            primaryLabel="Submit on behalf"
            primaryDisabled={primaryDisabled}
            loading={saving}
            onPrimary={() => void handlePrimary()}
          />
        }
      >
        <div className="grid min-h-0 min-h-[20rem] flex-1 grid-cols-1 max-[820px]:grid-cols-1 min-[820px]:grid-cols-[1.35fr_1fr]">
          <div className="min-h-0 overflow-y-auto overscroll-contain bg-white">
            <OnBehalfEmployeeSection
              options={hrEmployeePicker.options}
              value={hrEmployeePicker.value}
              onChange={hrEmployeePicker.onChange}
              employee={employee}
              submitterName={submitterName}
            />
            <OnBehalfLeaveForm {...formProps} />
          </div>
          <OnBehalfSummaryPanel
            preview={state.preview}
            chain={state.chain}
            balanceBefore={state.balanceBefore}
            balanceAfter={state.balanceAfter}
            applicantName={employee.name}
            hasDates={state.hasDates}
            submitterName={submitterName}
          />
        </div>
      </OnBehalfDialogShell>
    )
  }

  const gridClass = 'grid grid-cols-1 items-stretch gap-0 lg:grid-cols-2'

  return (
    <LeaveDialogRoot open={open} onOpenChange={handleOpenChange}>
      <LeaveDialogContent size="lg" describedBy="apply-leave-subtitle" className="max-h-[calc(100dvh-2rem)]">
        <LeaveDialogHeader
          title="Apply for leave"
          subtitle="Choose the leave type and dates. We will show your balance and approvers."
          subtitleId="apply-leave-subtitle"
          icon={CalendarPlus}
        />
        <LeaveDialogBody className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0">
          <div className={gridClass}>
            <div className="flex min-w-0 flex-col bg-white">
              <ApplyLeaveFormColumn
                settings={settings}
                balanceFor={state.balanceFor}
                policy={state.policy}
                preview={state.preview}
                leaveTypeCode={state.leaveTypeCode}
                setLeaveTypeCode={state.setLeaveTypeCode}
                fromDate={state.fromDate}
                setFromDate={state.setFromDate}
                toDate={state.toDate}
                setToDate={state.setToDate}
                portion={state.portion}
                setPortion={state.setPortion}
                halfDayAvailable={state.halfDayAvailable}
                reason={state.reason}
                setReason={state.setReason}
                attachmentName={state.attachmentName}
                setAttachmentName={state.setAttachmentName}
                convertLwp={state.convertLwp}
                setConvertLwp={state.setConvertLwp}
                touched={state.touched}
                setTouched={state.setTouched}
              />
            </div>
            <div className="flex min-w-0 flex-col bg-hrms-muted-bg/30 p-5">
              <ApplyLeaveSummaryPanel
                preview={state.preview}
                chain={state.chain}
                balanceBefore={state.balanceBefore}
                balanceAfter={state.balanceAfter}
                applicantName={employee.name}
                hasDates={state.hasDates}
              />
            </div>
          </div>
        </LeaveDialogBody>
        <LeaveDialogFooter className="bg-white">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-hrms-text-muted">
              {state.preview && state.preview.errors.length > 0
                ? 'Fix the issues in the preview panel to continue.'
                : !state.reason.trim()
                  ? 'Reason is required.'
                  : !state.hasDates
                    ? 'Select from and to dates.'
                    : 'Ready to submit when details are complete.'}
            </p>
            <LeaveDialogFooterActions
              primaryLabel="Submit request"
              loading={saving}
              primaryDisabled={primaryDisabled}
              onPrimary={() => void handlePrimary()}
            />
          </div>
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}