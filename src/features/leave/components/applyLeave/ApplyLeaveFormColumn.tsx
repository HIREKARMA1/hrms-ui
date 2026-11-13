/**
 * Left column form fields for ApplyLeaveDialog.
 */

import { Paperclip } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { LEAVE_TYPE_LABELS } from '../../constants/leaveTypeCodes'
import type { LeaveEmployee } from '../../types/employee'
import type { LeaveSettings, LeaveTypePolicy } from '../../types/leaveSettings'
import type { LedgerEntry } from '../../types/ledger'
import type { LeaveRequest } from '../../types/leaveRequest'
import { ledgerBalanceForType, pendingDaysForType } from '../../utils/calculateBalance'
import type { LeaveValidationResult } from '../../utils/validateLeaveRequest'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT, LEAVE_DIALOG_TEXTAREA } from '../shared/leaveUi'
import { ApplyLeaveSectionTitle } from './ApplyLeaveSectionTitle'

type ApplyLeaveFormColumnProps = {
  employee: LeaveEmployee
  settings: LeaveSettings
  ledger: LedgerEntry[]
  existing: LeaveRequest[]
  policy: LeaveTypePolicy | undefined
  preview: LeaveValidationResult | null
  leaveTypeCode: string
  setLeaveTypeCode: (v: string) => void
  fromDate: string
  setFromDate: (v: string) => void
  toDate: string
  setToDate: (v: string) => void
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
}

export function ApplyLeaveFormColumn(props: ApplyLeaveFormColumnProps) {
  const enabled = props.settings.leaveTypes.filter((item) => item.enabled)
  const policyHint = props.policy
    ? `Max ${props.policy.maxConsecutiveDays ?? '—'} consecutive days · ${props.policy.minNoticeDays} day(s) notice`
    : ''
  const needCert =
    props.policy?.medicalCertificateAfterDays !== null &&
    (props.preview?.daysCounted ?? 0) >= (props.policy?.medicalCertificateAfterDays ?? 999)

  return (
    <div className="flex min-h-full flex-col gap-6 px-6 py-5">
      <section className="space-y-3">
        <ApplyLeaveSectionTitle>Leave details</ApplyLeaveSectionTitle>
        <LeaveDialogField label="Leave type" htmlFor="leave-type" required>
          <select
            id="leave-type"
            className={LEAVE_DIALOG_SELECT}
            value={props.leaveTypeCode}
            onChange={(e) => props.setLeaveTypeCode(e.target.value)}
          >
            {enabled.map((item) => {
              const bal =
                ledgerBalanceForType(props.ledger, props.employee.id, item.code) -
                pendingDaysForType(props.existing, props.employee.id, item.code)
              return (
                <option key={item.code} value={item.code}>
                  {LEAVE_TYPE_LABELS[item.code as keyof typeof LEAVE_TYPE_LABELS] ?? item.label} ({bal}d)
                </option>
              )
            })}
          </select>
        </LeaveDialogField>
        {policyHint ? <p className="text-xs text-hrms-text-secondary">{policyHint}</p> : null}
      </section>

      <section className="space-y-3">
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
        {props.fromDate && props.toDate && !props.onBehalf ? (
          <p className="text-center text-xs tabular-nums text-hrms-text-secondary">{props.preview?.daysCounted ?? 0} day(s)</p>
        ) : null}
      </section>

      <section className="space-y-3">
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
