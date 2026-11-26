/**
 * Form state and validation preview for ApplyLeaveDialog.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { LeaveEmployee } from '../../types/employee'
import type { LeaveSettings } from '../../types/leaveSettings'
import type { LedgerEntry } from '../../types/ledger'
import type { HalfDayPortion, LeaveRequest } from '../../types/leaveRequest'
import type { ApplyLeaveTypeOption } from '../../utils/applyLeaveTypeOptionsFromBalance'
import { ledgerBalanceForType, pendingDaysForType } from '../../utils/calculateBalance'
import { getApprovalChain } from '../../utils/getApprovalChain'
import { validateLeaveRequest } from '../../utils/validateLeaveRequest'

const PREFERRED_TYPE = 'CL'

function defaultTypeCode(settings: LeaveSettings, balanceOptions: ApplyLeaveTypeOption[] | null | undefined): string {
  if (balanceOptions?.length) {
    const withBalance = balanceOptions.find((item) => item.available > 0)
    return (withBalance ?? balanceOptions[0]).code
  }
  const enabled = settings.leaveTypes.filter((item) => item.enabled)
  return enabled.some((item) => item.code === PREFERRED_TYPE) ? PREFERRED_TYPE : (enabled[0]?.code ?? '')
}

function resolveLeaveTypeCode(
  selectedCode: string,
  settings: LeaveSettings,
  balanceOptions: ApplyLeaveTypeOption[] | null | undefined,
): string {
  if (balanceOptions?.length) {
    if (balanceOptions.some((item) => item.code === selectedCode)) return selectedCode
    return defaultTypeCode(settings, balanceOptions)
  }
  if (settings.leaveTypes.some((item) => item.enabled && item.code === selectedCode)) return selectedCode
  return defaultTypeCode(settings, balanceOptions)
}

/**
 * `serverBalances` switches balances to the server: a code → available days
 * map, or null while unknown. Undefined keeps the demo ledger.
 * `balanceTypeOptions` non-null → dropdown driven by GET leave balance rows.
 */
export function useApplyLeaveDialogState(
  employee: LeaveEmployee,
  settings: LeaveSettings,
  ledger: LedgerEntry[],
  existing: LeaveRequest[],
  employees: LeaveEmployee[],
  serverBalances?: Record<string, number> | null,
  balanceTypeOptions?: ApplyLeaveTypeOption[] | null,
) {
  const [selectedCode, setLeaveTypeCode] = useState(() => defaultTypeCode(settings, balanceTypeOptions))
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [portion, setPortion] = useState<HalfDayPortion>('full')
  const [reason, setReason] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [convertLwp, setConvertLwp] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setLeaveTypeCode(defaultTypeCode(settings, balanceTypeOptions))
  }, [balanceTypeOptions, settings])

  const reset = useCallback(() => {
    setLeaveTypeCode(defaultTypeCode(settings, balanceTypeOptions))
    setFromDate('')
    setToDate('')
    setPortion('full')
    setReason('')
    setAttachmentName('')
    setConvertLwp(false)
    setTouched({})
  }, [balanceTypeOptions, settings])

  const serverMode = serverBalances !== undefined
  const leaveTypeCode = resolveLeaveTypeCode(selectedCode, settings, balanceTypeOptions)
  const byId = useMemo(() => Object.fromEntries(employees.map((item) => [item.id, item])), [employees])
  const policy = settings.leaveTypes.find((item) => item.code === leaveTypeCode)
  const halfDayAvailable = Boolean(fromDate && fromDate === toDate && policy?.halfDayAllowed)
  const effectivePortion: HalfDayPortion = halfDayAvailable ? portion : 'full'
  const serverBalance = useMemo(
    () => (serverMode ? { availableByType: serverBalances ?? null } : undefined),
    [serverBalances, serverMode],
  )
  const preview = useMemo(
    () =>
      fromDate && toDate && policy
        ? validateLeaveRequest(
            {
              employeeId: employee.id,
              leaveTypeCode,
              fromDate,
              toDate,
              reason,
              attachmentName,
              portion: effectivePortion,
              convertExtraToLwp: convertLwp,
            },
            settings,
            employee,
            ledger,
            existing,
            employees,
            serverBalance,
          )
        : null,
    [attachmentName, convertLwp, effectivePortion, employee, employees, existing, fromDate, leaveTypeCode, ledger, policy, reason, serverBalance, settings, toDate],
  )
  const chain = policy && preview ? getApprovalChain(policy, employee, byId, preview.daysCounted) : []

  const balanceFor = useCallback(
    (code: string): number | null => {
      if (serverMode) return serverBalances ? (serverBalances[code] ?? 0) : null
      return ledgerBalanceForType(ledger, employee.id, code) - pendingDaysForType(existing, employee.id, code)
    },
    [employee.id, existing, ledger, serverBalances, serverMode],
  )
  const balanceBefore = balanceFor(leaveTypeCode)
  const balanceAfter = balanceBefore === null ? null : balanceBefore - (preview?.daysCounted ?? 0)

  return {
    policy,
    preview,
    chain,
    balanceBefore,
    balanceAfter,
    balanceFor,
    hasDates: Boolean(fromDate && toDate),
    leaveTypeCode,
    setLeaveTypeCode,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    portion: effectivePortion,
    setPortion,
    halfDayAvailable,
    reason,
    setReason,
    attachmentName,
    setAttachmentName,
    convertLwp,
    setConvertLwp,
    touched,
    setTouched,
    submitPayload: {
      leaveTypeCode,
      fromDate,
      toDate,
      reason,
      attachmentName,
      convertExtraToLwp: convertLwp,
      portion: effectivePortion,
    },
    reset,
  }
}