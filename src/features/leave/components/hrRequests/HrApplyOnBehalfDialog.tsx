/**
 * Apply leave on behalf of a non-terminated employee (HR Requests tab).
 * Server snapshots read the selected employee's balance from the API.
 */

import { useMemo, useState } from 'react'

import { useGetLeaveBalanceQuery } from '../../api/leaveApi'
import { useEmployeeLeaveRequestsForValidation } from '../../hooks/useEmployeeLeaveRequestsForValidation'
import { availableByTypeCode, mapLeaveBalanceRows } from '../../api/leaveMappers'
import { applyLeaveTypeOptionsFromBalance } from '../../utils/applyLeaveTypeOptionsFromBalance'
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
  const balanceRows = useMemo(
    () => (api && balance.data ? mapLeaveBalanceRows(balance.data, api.leaveTypes) : null),
    [api, balance.data],
  )
  const serverBalances = useMemo(() => {
    if (!api) return undefined
    return balanceRows ? availableByTypeCode(balanceRows) : null
  }, [api, balanceRows])
  const balanceTypeOptions = useMemo(() => {
    if (!api) return null
    if (!balanceRows) return []
    return applyLeaveTypeOptionsFromBalance(balanceRows) ?? []
  }, [api, balanceRows])
  const applyExisting = useEmployeeLeaveRequestsForValidation(
    resolvedId,
    Boolean(api),
    Boolean(api && open),
    snapshot.requests,
  )

  if (!employee) return null

  return (
    <ApplyLeaveDialog
      open={open}
      onOpenChange={onOpenChange}
      employee={employee}
      settings={snapshot.settings}
      ledger={snapshot.ledger}
      existing={applyExisting}
      employees={snapshot.employees}
      saving={saving}
      submitterName={submitterName}
      serverBalances={serverBalances}
      balanceTypeOptions={balanceTypeOptions}
      balanceTypesLoading={Boolean(api && open && balance.isFetching && !balanceRows)}
      hrEmployeePicker={{ options, value: resolvedId, onChange: setEmployeeId }}
      onSubmit={(input) => onSubmit(resolvedId, input)}
    />
  )
}
