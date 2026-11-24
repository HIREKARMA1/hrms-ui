/**
 * Apply leave on behalf of a non-terminated employee (HR Requests tab).
 * Server snapshots read the selected employee's balance from the API.
 */

import { useMemo, useState } from 'react'

import { useGetLeaveBalanceQuery } from '../../api/leaveApi'
import { availableByTypeCode, mapLeaveBalanceRows } from '../../api/leaveMappers'
import type { LeaveSnapshot } from '../../services/leaveService'
import { activeEmployees } from '../../utils/employmentStatus'
import { ApplyLeaveDialog, type ApplyLeaveSubmitInput, type ApplyLeaveSubmitOutcome } from '../applyLeave/ApplyLeaveDialog'

type HrApplyOnBehalfDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: LeaveSnapshot
  submitterName?: string
  saving?: boolean
  onSubmit: (employeeId: string, input: ApplyLeaveSubmitInput) => ApplyLeaveSubmitOutcome
}

export function HrApplyOnBehalfDialog({ open, onOpenChange, snapshot, submitterName, saving, onSubmit }: HrApplyOnBehalfDialogProps) {
  const options = useMemo(() => activeEmployees(snapshot.employees).filter((item) => !item.id.startsWith('EMP-HR')), [snapshot.employees])
  const [employeeId, setEmployeeId] = useState(options[0]?.id ?? '')
  const resolvedId = options.some((item) => item.id === employeeId) ? employeeId : (options[0]?.id ?? '')
  const employee = options.find((item) => item.id === resolvedId) ?? options[0]

  const api = snapshot.api
  const balance = useGetLeaveBalanceQuery({ employeeId: resolvedId }, { skip: !api || !open || !resolvedId })
  const serverBalances = useMemo(() => {
    if (!api) return undefined
    return balance.data ? availableByTypeCode(mapLeaveBalanceRows(balance.data, api.leaveTypes)) : null
  }, [api, balance.data])

  if (!employee) return null

  return (
    <ApplyLeaveDialog
      open={open}
      onOpenChange={onOpenChange}
      employee={employee}
      settings={snapshot.settings}
      ledger={snapshot.ledger}
      existing={snapshot.requests}
      employees={snapshot.employees}
      saving={saving}
      submitterName={submitterName}
      serverBalances={serverBalances}
      hrEmployeePicker={{ options, value: resolvedId, onChange: setEmployeeId }}
      onSubmit={(input) => onSubmit(resolvedId, input)}
    />
  )
}
