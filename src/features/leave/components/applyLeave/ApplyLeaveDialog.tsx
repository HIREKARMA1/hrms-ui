/**
 * Two-column Apply for leave dialog with validation preview and summary panel.
 */

import { CalendarPlus, UserRound } from 'lucide-react'

import type { LeaveEmployee } from '../../types/employee'
import type { LeaveSettings } from '../../types/leaveSettings'
import type { LedgerEntry } from '../../types/ledger'
import type { LeaveRequest } from '../../types/leaveRequest'
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
import { ApplyOnBehalfEmployeeField } from './ApplyOnBehalfEmployeeField'
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
  onSubmit: (input: {
    leaveTypeCode: string
    fromDate: string
    toDate: string
    reason: string
    attachmentName?: string
    convertExtraToLwp?: boolean
  }) => void
  hrEmployeePicker?: {
    options: LeaveEmployee[]
    value: string
    onChange: (employeeId: string) => void
  }
}

export function ApplyLeaveDialog(props: ApplyLeaveDialogProps) {
  const { open, onOpenChange, employee, settings, ledger, existing, employees, saving, onSubmit, hrEmployeePicker, submitterName } =
    props
  const onBehalf = Boolean(hrEmployeePicker)
  const state = useApplyLeaveDialogState(employee, settings, ledger, existing, employees)

  const handleOpenChange = (next: boolean) => {
    if (!next) state.reset()
    onOpenChange(next)
  }

  // The grid takes its natural height; the dialog body (below) is the single
  // scroll container. Columns stack on small screens and split from `lg`.
  const gridClass = onBehalf
    ? 'grid grid-cols-1 items-stretch divide-y divide-hrms-border lg:min-h-[32rem] lg:grid-cols-2 lg:divide-x lg:divide-y-0'
    : 'grid grid-cols-1 items-stretch gap-0 lg:grid-cols-2'

  return (
    <LeaveDialogRoot open={open} onOpenChange={handleOpenChange}>
      <LeaveDialogContent
        size={onBehalf ? 'xl' : 'lg'}
        describedBy="apply-leave-subtitle"
        className="max-h-[calc(100dvh-2rem)]"
      >
        <LeaveDialogHeader
          title={onBehalf ? 'Apply on behalf' : 'Apply for leave'}
          subtitle={
            onBehalf
              ? 'Complete leave details for the selected employee.'
              : 'Choose the leave type and dates. We will show your balance and approvers.'
          }
          subtitleId="apply-leave-subtitle"
          icon={onBehalf ? UserRound : CalendarPlus}
        />
        <LeaveDialogBody className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0">
          <div className={gridClass}>
            <div className="flex min-w-0 flex-col bg-white">
              {hrEmployeePicker ? (
                <div className="border-b border-hrms-border px-6 py-4">
                  <ApplyOnBehalfEmployeeField
                    options={hrEmployeePicker.options}
                    value={hrEmployeePicker.value}
                    onChange={hrEmployeePicker.onChange}
                    employee={employee}
                    submitterName={submitterName}
                  />
                </div>
              ) : null}
              <ApplyLeaveFormColumn
                employee={employee}
                settings={settings}
                ledger={ledger}
                existing={existing}
                policy={state.policy}
                preview={state.preview}
                leaveTypeCode={state.leaveTypeCode}
                setLeaveTypeCode={state.setLeaveTypeCode}
                fromDate={state.fromDate}
                setFromDate={state.setFromDate}
                toDate={state.toDate}
                setToDate={state.setToDate}
                reason={state.reason}
                setReason={state.setReason}
                attachmentName={state.attachmentName}
                setAttachmentName={state.setAttachmentName}
                convertLwp={state.convertLwp}
                setConvertLwp={state.setConvertLwp}
                touched={state.touched}
                setTouched={state.setTouched}
                compactAttachment={onBehalf}
                onBehalf={onBehalf}
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
                onBehalf={onBehalf}
                submitterName={submitterName}
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
              primaryLabel={onBehalf ? 'Submit on behalf' : 'Submit request'}
              loading={saving}
              primaryDisabled={!state.preview || state.preview.errors.length > 0 || !state.reason.trim()}
              onPrimary={() => {
                onSubmit(state.submitPayload)
                state.reset()
                onOpenChange(false)
              }}
            />
          </div>
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
