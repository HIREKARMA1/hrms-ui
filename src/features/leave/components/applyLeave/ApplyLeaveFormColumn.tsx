/**
 * Left column form fields for ApplyLeaveDialog.
 */

import { Paperclip } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { LEAVE_TYPE_LABELS } from '../../constants/leaveTypeCodes'
import type { ApplyLeaveTypeOption } from '../../utils/applyLeaveTypeOptionsFromBalance'
import { ApplyLeaveTypeSelect } from './ApplyLeaveTypeSelect'
import type { LeaveSettings, LeaveTypePolicy } from '../../types/leaveSettings'
import type { HalfDayPortion } from '../../types/leaveRequest'
import type { LeaveValidationResult } from '../../utils/validateLeaveRequest'
import { applyLeavePolicyDisplayHint } from '../../utils/applyLeavePolicyDisplayHint'
import { leaveTodayIso } from '../../utils/leaveToday'
import { ApplyLeaveBalanceStrip } from './ApplyLeaveBalanceStrip'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT, LEAVE_DIALOG_TEXTAREA } from '../shared/leaveUi'
import { ApplyLeaveSectionTitle } from './ApplyLeaveSectionTitle'

type ApplyLeaveFormColumnProps = {
  settings: LeaveSettings
  /** Available days for a type code, or null when unknown. */
  balanceFor: (code: string) => number | null
  policy: LeaveTypePolicy | undefined
  preview: LeaveValidationResult | null
  leaveTypeCode: string
  setLeaveTypeCode: (v: string) => void
  fromDate: string
  setFromDate: (v: string) => void
  toDate: string
  setToDate: (v: string) => void
  portion: HalfDayPortion
  setPortion: (v: HalfDayPortion) => void
  halfDayAvailable: boolean
  reason: string
  setReason: (v: string) => void
  attachmentName: string
  setAttachmentName: (v: string) => void
  convertLwp: boolean
  setConvertLwp: (v: boolean) => void
  touched: Record<string, boolean>
  setTouched: (fn: (t: Record<string, boolean>) => Record<string, boolean>) => void
  compactAttachment?: boolean
  onBehalf?: boolean
  /** From GET leave balance; `null`/`undefined` = demo settings list */
  balanceTypeOptions?: ApplyLeaveTypeOption[] | null
  balanceTypesLoading?: boolean
}

export function ApplyLeaveFormColumn(props: ApplyLeaveFormColumnProps) {
  const balanceOptions = props.balanceTypeOptions
  const demoOptions = useMemo(() => {
    if (balanceOptions) return undefined
    return props.settings.leaveTypes
      .filter((item) => item.enabled)
      .map((item) => ({
        code: item.code,
        label: LEAVE_TYPE_LABELS[item.code as keyof typeof LEAVE_TYPE_LABELS] ?? item.label,
        available: props.balanceFor(item.code),
      }))
  }, [balanceOptions, props.balanceFor, props.settings.leaveTypes])

  const typeSelectDisabled = Boolean(
    props.balanceTypesLoading && balanceOptions && balanceOptions.length === 0,
  )
  const policyHint = applyLeavePolicyDisplayHint(props.policy)
  const selectedBalanceRow = balanceOptions?.find((row) => row.code === props.leaveTypeCode)
  const selectedAvail = props.balanceFor(props.leaveTypeCode)
  const needCert =
    props.policy?.medicalCertificateAfterDays !== null &&
    (props.preview?.daysCounted ?? 0) >= (props.policy?.medicalCertificateAfterDays ?? 999)

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <section className="space-y-2.5">
        <ApplyLeaveSectionTitle>Leave details</ApplyLeaveSectionTitle>
        <LeaveDialogField label="Leave type" htmlFor="leave-type" required>
          <ApplyLeaveTypeSelect
            id="leave-type"
            value={props.leaveTypeCode}
            options={balanceOptions ?? []}
            demoOptions={demoOptions}
            loading={Boolean(props.balanceTypesLoading && balanceOptions && balanceOptions.length === 0)}
            disabled={typeSelectDisabled}
            onChange={props.setLeaveTypeCode}
          />
        </LeaveDialogField>
        <ApplyLeaveBalanceStrip
          available={selectedAvail}
          used={selectedBalanceRow?.used}
          pending={selectedBalanceRow?.pending}
        />
        {policyHint ? <p className="text-xs text-hrms-text-muted">{policyHint}</p> : null}
      </section>

      <section className="space-y-2.5">
        <ApplyLeaveSectionTitle>Dates</ApplyLeaveSectionTitle>
        <div className="grid gap-3 grid-cols-2">
          <LeaveDialogField label="From" htmlFor="from-date" required>
            <input
              id="from-date"
              type="date"
              min={leaveTodayIso()}
              className={LEAVE_DIALOG_INPUT}
              value={props.fromDate}
              onChange={(e) => props.setFromDate(e.target.value)}
              onBlur={() => props.setTouched((t) => ({ ...t, from: true }))}
            />
          </LeaveDialogField>
          <LeaveDialogField label="To" htmlFor="to-date" required>
            <input
              id="to-date"
              type="date"
              min={props.fromDate || leaveTodayIso()}
              className={LEAVE_DIALOG_INPUT}
              value={props.toDate}
              onChange={(e) => props.setToDate(e.target.value)}
            />
          </LeaveDialogField>
        </div>
        {props.halfDayAvailable ? (
          <LeaveDialogField label="Duration" htmlFor="leave-portion">
            <select
              id="leave-portion"
              className={LEAVE_DIALOG_SELECT}
              value={props.portion}
              onChange={(e) => props.setPortion(e.target.value as HalfDayPortion)}
            >
              <option value="full">Full day</option>
              <option value="first_half">First half</option>
              <option value="second_half">Second half</option>
            </select>
          </LeaveDialogField>
        ) : null}
        {props.fromDate && props.toDate && !props.onBehalf ? (
          <p className="text-center text-xs tabular-nums text-hrms-text-secondary">{props.preview?.daysCounted ?? 0} day(s)</p>
        ) : null}
      </section>

      <section className="space-y-2.5">
        <ApplyLeaveSectionTitle>Notes</ApplyLeaveSectionTitle>
        <LeaveDialogField
          label="Reason"
          htmlFor="leave-reason"
          required
          touched={props.touched.reason}
          error={props.touched.reason && !props.reason.trim() ? 'Reason is required.' : undefined}
        >
          <textarea
            id="leave-reason"
            maxLength={200}
            rows={3}
            className={LEAVE_DIALOG_TEXTAREA}
            value={props.reason}
            onChange={(e) => props.setReason(e.target.value)}
            onBlur={() => props.setTouched((t) => ({ ...t, reason: true }))}
          />
          <p className="text-right text-xs tabular-nums text-hrms-text-muted">{props.reason.length}/200</p>
        </LeaveDialogField>

        <LeaveDialogField label="Attachment" htmlFor="leave-file">
          {props.compactAttachment ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 border-hrms-border" asChild>
                <label className="cursor-pointer">
                  <Paperclip className="h-4 w-4" aria-hidden />
                  Choose file
                  <input
                    id="leave-file"
                    type="file"
                    className="sr-only"
                    onChange={(e) => props.setAttachmentName(e.target.files?.[0]?.name ?? '')}
                  />
                </label>
              </Button>
              {props.attachmentName ? (
                <span className="truncate text-sm font-medium text-hrms-navy">{props.attachmentName}</span>
              ) : (
                <span className="text-xs text-hrms-text-muted">Optional</span>
              )}
            </div>
          ) : (
            <label
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-hrms-border bg-hrms-muted-bg/50 px-4 py-6 text-center text-xs text-hrms-text-secondary"
            >
              <span>Click to attach a file</span>
              <input
                id="leave-file"
                type="file"
                className="sr-only"
                onChange={(e) => props.setAttachmentName(e.target.files?.[0]?.name ?? '')}
              />
              {props.attachmentName ? <span className="font-medium text-hrms-navy">{props.attachmentName}</span> : null}
            </label>
          )}
          <p className={cn('mt-1 text-xs', needCert ? 'text-hrms-danger' : 'text-hrms-text-muted')}>
            {needCert ? 'Medical certificate required' : props.compactAttachment ? null : 'Optional'}
          </p>
        </LeaveDialogField>
      </section>

      {props.preview?.warnings.some((item) => item.includes('Convert the extra')) ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={props.convertLwp} onChange={(e) => props.setConvertLwp(e.target.checked)} />
          Convert extra days to Leave Without Pay
        </label>
      ) : null}
    </div>
  )
}
