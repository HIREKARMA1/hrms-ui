/**
 * Form state and validation preview for ApplyLeaveDialog.
 */

import { useCallback, useMemo, useState } from 'react'

import type { LeaveEmployee } from '../../types/employee'
import type { LeaveSettings } from '../../types/leaveSettings'
import type { LedgerEntry } from '../../types/ledger'
import type { LeaveRequest } from '../../types/leaveRequest'
import { ledgerBalanceForType, pendingDaysForType } from '../../utils/calculateBalance'
import { getApprovalChain } from '../../utils/getApprovalChain'
import { validateLeaveRequest } from '../../utils/validateLeaveRequest'

export function useApplyLeaveDialogState(
  employee: LeaveEmployee,
  settings: LeaveSettings,
  ledger: LedgerEntry[],
  existing: LeaveRequest[],
  employees: LeaveEmployee[],
) {
  const [leaveTypeCode, setLeaveTypeCode] = useState('CL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [convertLwp, setConvertLwp] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const reset = useCallback(() => {
    setLeaveTypeCode('CL')
    setFromDate('')
    setToDate('')
    setReason('')
    setAttachmentName('')
    setConvertLwp(false)
    setTouched({})
  }, [])

  const byId = useMemo(() => Object.fromEntries(employees.map((item) => [item.id, item])), [employees])
  const policy = settings.leaveTypes.find((item) => item.code === leaveTypeCode)
  const preview = useMemo(
    () =>
      fromDate && toDate && policy
        ? validateLeaveRequest(
            { employeeId: employee.id, leaveTypeCode, fromDate, toDate, reason, attachmentName, convertExtraToLwp: convertLwp },
            settings,
            employee,
            ledger,
            existing,
            employees,
          )
        : null,
    [attachmentName, convertLwp, employee, employees, existing, fromDate, leaveTypeCode, ledger, policy, reason, settings, toDate],
  )
  const chain = policy && preview ? getApprovalChain(policy, employee, byId, preview.daysCounted) : []
  const balanceBefore =
    ledgerBalanceForType(ledger, employee.id, leaveTypeCode) - pendingDaysForType(existing, employee.id, leaveTypeCode)
  const balanceAfter = balanceBefore - (preview?.daysCounted ?? 0)

  return {
    policy,
    preview,
    chain,
    balanceBefore,
    balanceAfter,
    hasDates: Boolean(fromDate && toDate),
    leaveTypeCode,
    setLeaveTypeCode,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    reason,
    setReason,
    attachmentName,
    setAttachmentName,
    convertLwp,
    setConvertLwp,
    touched,
    setTouched,
    submitPayload: { leaveTypeCode, fromDate, toDate, reason, attachmentName, convertExtraToLwp: convertLwp },
    reset,
  }
}
