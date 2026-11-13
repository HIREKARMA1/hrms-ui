/**
 * Collapsible extra rules for the leave type editor.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import { resolveEarningModel, accruesLeaveBalance } from '../../../utils/leaveEarningModel'
import { countLeaveTypeRules } from '../../../utils/countLeaveTypeRules'
import { SettingsField } from '../shared/SettingsField'
import { SettingsSegmented } from '../shared/SettingsSegmented'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'
import { LEAVE_MOTION } from '../../shared/leaveUi'

export function EditLeaveTypeMoreRules({ value, onChange }: { value: LeaveTypePolicy; onChange: (n: LeaveTypePolicy) => void }) {
  const [open, setOpen] = useState(false)
  const count = countLeaveTypeRules(value)
  const model = resolveEarningModel(value)
  const showBalanceRules = accruesLeaveBalance(value)
  const encashBlocked = model === 'unpaid' || model === 'per_event' || model === 'comp_off'
  const set = (patch: Partial<LeaveTypePolicy>) => onChange({ ...value, ...patch })

  return (
    <div className="rounded-xl border border-hrms-border">
      <button
        type="button"
        className={cn('flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-hrms-navy', LEAVE_MOTION)}
        onClick={() => setOpen((item) => !item)}
        aria-expanded={open}
      >
        <span>More rules</span>
        <span className="flex items-center gap-2 text-xs font-normal text-hrms-text-secondary">
          {count} rule{count === 1 ? '' : 's'} set
          <ChevronDown className={cn('h-4 w-4', open && 'rotate-180', LEAVE_MOTION)} aria-hidden />
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-hrms-border px-3 py-3">
          <SettingsField label="Longest single leave">
            <SettingsNumberInput value={value.maxConsecutiveDays ?? 0} onChange={(n) => set({ maxConsecutiveDays: n || null })} unit="days" min={0} />
          </SettingsField>
          <SettingsField label="Apply at least N days before">
            <SettingsNumberInput value={value.minNoticeDays} onChange={(minNoticeDays) => set({ minNoticeDays })} unit="days" min={0} />
          </SettingsField>
          <SettingsField label="Apply for past dates up to">
            <SettingsNumberInput value={value.backdatingAllowedDays} onChange={(backdatingAllowedDays) => set({ backdatingAllowedDays })} unit="days" min={0} />
          </SettingsField>
          <SettingsField label="Medical certificate after" helper="0 means never.">
            <SettingsNumberInput value={value.medicalCertificateAfterDays ?? 0} onChange={(n) => set({ medicalCertificateAfterDays: n || null })} unit="days" min={0} />
          </SettingsField>
          <span className="text-sm font-medium text-hrms-navy">Half days allowed</span>
          <Switch checked={value.halfDayAllowed} onCheckedChange={(halfDayAllowed) => set({ halfDayAllowed })} />
          <SettingsField label="How days are counted">
            <SettingsSegmented
              ariaLabel="Day counting"
              value={value.dayCounting}
              onChange={(dayCounting) => set({ dayCounting: dayCounting as LeaveTypePolicy['dayCounting'] })}
              options={[
                { value: 'working', label: 'Working days' },
                { value: 'calendar', label: 'Calendar days' },
              ]}
            />
          </SettingsField>
          {showBalanceRules ? (
            <>
              <SettingsSegmented
                ariaLabel="Unused days"
                value={value.carryForward}
                onChange={(carryForward) => set({ carryForward: carryForward as LeaveTypePolicy['carryForward'] })}
                options={[
                  { value: 'none', label: 'Expire' },
                  { value: 'capped', label: 'Carry forward' },
                ]}
              />
              {value.carryForward === 'capped' ? (
                <SettingsNumberInput value={value.carryForwardCapDays ?? 0} onChange={(carryForwardCapDays) => set({ carryForwardCapDays })} unit="days" min={1} />
              ) : null}
              <Switch checked={value.encashable} disabled={encashBlocked} onCheckedChange={(encashable) => set({ encashable })} aria-label="Paid out in cash" />
              {encashBlocked ? <p className="text-xs text-hrms-text-secondary">Paid out in cash is not available for this earning model.</p> : null}
              <Switch checked={value.allowLwpConversion} onCheckedChange={(allowLwpConversion) => set({ allowLwpConversion })} aria-label="Unpaid overflow" />
            </>
          ) : null}
          <SettingsField label="Minimum service" helper="On top of the company-wide probation in General.">
            <SettingsNumberInput value={value.minServiceMonths} onChange={(minServiceMonths) => set({ minServiceMonths })} unit="months" min={0} />
          </SettingsField>
        </div>
      ) : null}
    </div>
  )
}
