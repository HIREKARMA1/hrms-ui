import { Calendar, ChevronDown, Paperclip } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import { LEAVE_TYPE_LABELS } from '../../../constants/leaveTypeCodes'
import type { ApplyLeaveTypeOption } from '../../../utils/applyLeaveTypeOptionsFromBalance'
import { applyLeavePolicyDisplayHint } from '../../../utils/applyLeavePolicyDisplayHint'
import { ApplyLeaveBalanceStrip } from '../ApplyLeaveBalanceStrip'
import { ApplyLeaveTypeSelect } from '../ApplyLeaveTypeSelect'
import type { LeaveSettings, LeaveTypePolicy } from '../../../types/leaveSettings'
import type { HalfDayPortion } from '../../../types/leaveRequest'
import type { LeaveValidationResult } from '../../../utils/validateLeaveRequest'
import { leaveTodayIso } from '../../../utils/leaveToday'
import { OnBehalfDialogField } from './OnBehalfDialogField'
import {
  obControlClass,
  obSectionTitleClass,
  obSelectClass,
  obTextareaClass,
} from './onBehalfDialogUi'

type OnBehalfLeaveFormProps = {
  settings: LeaveSettings
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
  balanceTypeOptions?: ApplyLeaveTypeOption[] | null
  balanceTypesLoading?: boolean
}

export function OnBehalfLeaveForm(props: OnBehalfLeaveFormProps) {
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
    <div className="flex flex-col">
      <section className="space-y-4 border-b border-[#E2E6EF] px-6 py-[22px] max-[480px]:px-4">
        <h3 className={obSectionTitleClass}>Leave details</h3>
        <OnBehalfDialogField label="Leave type" htmlFor="leave-type" required>
          <ApplyLeaveTypeSelect
            id="leave-type"
            value={props.leaveTypeCode}
            options={balanceOptions ?? []}
            demoOptions={demoOptions}
            loading={Boolean(props.balanceTypesLoading && balanceOptions && balanceOptions.length === 0)}
            disabled={typeSelectDisabled}
            triggerClassName={obSelectClass}
            onChange={props.setLeaveTypeCode}
          />
        </OnBehalfDialogField>
        <ApplyLeaveBalanceStrip
          available={selectedAvail}
          used={selectedBalanceRow?.used}
          pending={selectedBalanceRow?.pending}
        />
        {policyHint ? <p className="text-[12.5px] text-[#667085]">{policyHint}</p> : null}
      </section>

      <section className="space-y-4 border-b border-[#E2E6EF] px-6 py-[22px] max-[480px]:px-4">
        <h3 className={obSectionTitleClass}>Dates</h3>
        <div className="grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2">
          <OnBehalfDialogField label="From" htmlFor="from-date" required>
            <div className="relative">
              <input
                id="from-date"
                type="date"
                min={leaveTodayIso()}
                className={cn(obControlClass, 'pr-10')}
                value={props.fromDate}
                onChange={(e) => props.setFromDate(e.target.value)}
                onBlur={() => props.setTouched((t) => ({ ...t, from: true }))}
              />
              <Calendar
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden
              />
            </div>
          </OnBehalfDialogField>
          <OnBehalfDialogField label="To" htmlFor="to-date" required>
            <div className="relative">
              <input
                id="to-date"
                type="date"
                min={props.fromDate || leaveTodayIso()}
                className={cn(obControlClass, 'pr-10')}
                value={props.toDate}
                onChange={(e) => props.setToDate(e.target.value)}
              />
              <Calendar
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden
              />
            </div>
          </OnBehalfDialogField>
        </div>
        {props.halfDayAvailable ? (
          <OnBehalfDialogField label="Duration" htmlFor="leave-portion">
            <div className="relative">
              <select
                id="leave-portion"
                className={obSelectClass}
                value={props.portion}
                onChange={(e) => props.setPortion(e.target.value as HalfDayPortion)}
              >
                <option value="full">Full day</option>
                <option value="first_half">First half</option>
                <option value="second_half">Second half</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden
              />
            </div>
          </OnBehalfDialogField>
        ) : null}
      </section>

      <section className="space-y-4 px-6 py-[22px] max-[480px]:px-4">
        <h3 className={obSectionTitleClass}>Notes</h3>
        <OnBehalfDialogField
          label="Reason"
          htmlFor="leave-reason"
          required
          touched={props.touched.reason}
          error={props.touched.reason && !props.reason.trim() ? 'Reason is required.' : undefined}
        >
          <textarea
            id="leave-reason"
            maxLength={200}
            rows={4}
            className={obTextareaClass}
            value={props.reason}
            onChange={(e) => props.setReason(e.target.value)}
            onBlur={() => props.setTouched((t) => ({ ...t, reason: true }))}
          />
          <p className="mt-1 text-right text-xs tabular-nums text-[#98A2B3]">{props.reason.length}/200</p>
        </OnBehalfDialogField>

        <OnBehalfDialogField label="Attachment" htmlFor="leave-file">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#E2E6EF] bg-white px-4 text-sm font-semibold text-[#17213A] transition-colors hover:bg-[#CCFBF1] focus-within:outline focus-within:outline-2 focus-within:outline-[#8B5CF6]">
              <Paperclip className="h-4 w-4 text-[#0F766E]" aria-hidden />
              Choose file
              <input
                id="leave-file"
                type="file"
                className="sr-only"
                onChange={(e) => props.setAttachmentName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
            {props.attachmentName ? (
              <span className="truncate text-sm font-semibold text-[#17213A]">{props.attachmentName}</span>
            ) : (
              <span className="text-xs text-[#98A2B3]">Optional</span>
            )}
          </div>
          {needCert ? (
            <p className="mt-1 text-xs text-[#EF4444]">Medical certificate required</p>
          ) : null}
        </OnBehalfDialogField>
      </section>

      {props.preview?.warnings.some((item) => item.includes('Convert the extra')) ? (
        <label className="flex items-center gap-2 px-6 pb-[22px] text-sm text-[#17213A] max-[480px]:px-4">
          <input type="checkbox" checked={props.convertLwp} onChange={(e) => props.setConvertLwp(e.target.checked)} />
          Convert extra days to Leave Without Pay
        </label>
      ) : null}
    </div>
  )
}