/**
 * Two-column Apply for leave dialog with validation preview and summary panel.
 */

import { CalendarPlus, UserRound } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { useGetLeaveTypesQuery } from '../../api/leaveTypesApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
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
import { mergeLeaveTypesForApply } from '../../utils/mapApiLeaveTypesForApply'
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

  const canFetchLeaves = useShouldFetchLeaveList()
  const shouldFetchTypes = Boolean(open && canFetchLeaves)
  const {
    data: leaveTypesData,
    isError: leaveTypesIsError,
    error: leaveTypesError,
    isFetching: leaveTypesFetching,
  } = useGetLeaveTypesQuery(undefined, { skip: !shouldFetchTypes })

  const applySettings = useMemo(() => {
    if (shouldFetchTypes && leaveTypesData && !leaveTypesIsError) {
      return mergeLeaveTypesForApply(settings, leaveTypesData)
    }
    return settings
  }, [leaveTypesData, leaveTypesIsError, settings, shouldFetchTypes])

  const state = useApplyLeaveDialogState(employee, applySettings, ledger, existing, employees)

  const leaveTypesErrorMessage =
    shouldFetchTypes && leaveTypesIsError
      ? getApiErrorMessage(leaveTypesError, 'Unable to load leave types. Using demo policies.')
      : null

  useEffect(() => {
    if (!open) return
    const enabled = applySettings.leaveTypes.filter((item) => item.enabled)
    const hasCode = enabled.some((item) => item.code === state.leaveTypeCode)
    if (!hasCode && enabled[0]) {
      state.setLeaveTypeCode(enabled[0].code)
    }
  }, [applySettings.leaveTypes, open, state.leaveTypeCode, state.setLeaveTypeCode])

  const handleOpenChange = (next: boolean) => {
    if (!next) state.reset()
    onOpenChange(next)
  }

  const gridClass = onBehalf
    ? 'grid min-h-[32rem] flex-1 grid-cols-2 grid-rows-1 items-stretch divide-x divide-hrms-border overflow-y-auto'
    : 'grid min-h-0 flex-1 gap-0 lg:grid-cols-2'

  return (
    <LeaveDialogRoot open={open} onOpenChange={handleOpenChange}>
      <LeaveDialogContent size={onBehalf ? 'xl' : 'lg'} describedBy="apply-leave-subtitle">
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
        <LeaveDialogBody className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          {leaveTypesErrorMessage ? (
            <p
              className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              role="alert"
            >
              {leaveTypesErrorMessage}
            </p>
          ) : null}
          {leaveTypesFetching && shouldFetchTypes ? (
            <p className="px-6 pt-4 text-xs text-hrms-text-muted">Loading leave types…</p>
          ) : null}
          <div className={gridClass}>
            <div className="flex min-h-full min-w-0 flex-col bg-white">
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
                settings={applySettings}
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
            <div className="flex min-h-full min-w-0 flex-col bg-hrms-muted-bg/30 p-5">
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
        <LeaveDialogFooter>
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
