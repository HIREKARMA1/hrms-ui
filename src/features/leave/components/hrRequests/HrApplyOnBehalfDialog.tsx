/**
 * Apply leave on behalf of a non-terminated employee (HR Requests tab).
 */

import { useMemo, useState } from 'react'

import type { LeaveSnapshot } from '../../services/leaveService'
import { activeEmployees } from '../../utils/employmentStatus'
import { ApplyLeaveDialog } from '../applyLeave/ApplyLeaveDialog'

type HrApplyOnBehalfDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: LeaveSnapshot
  submitterName?: string
  saving?: boolean
  onSubmit: (employeeId: string, input: Parameters<NonNullable<Parameters<typeof ApplyLeaveDialog>[0]['onSubmit']>>[0]) => void
}

export function HrApplyOnBehalfDialog({ open, onOpenChange, snapshot, submitterName, saving, onSubmit }: HrApplyOnBehalfDialogProps) {
  const options = useMemo(() => activeEmployees(snapshot.employees).filter((item) => !item.id.startsWith('EMP-HR')), [snapshot.employees])
  const [employeeId, setEmployeeId] = useState(options[0]?.id ?? '')
  const resolvedId = options.some((item) => item.id === employeeId) ? employeeId : (options[0]?.id ?? '')
  const employee = options.find((item) => item.id === resolvedId) ?? options[0]

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
      hrEmployeePicker={{ options, value: resolvedId, onChange: setEmployeeId }}
      onSubmit={(input) => onSubmit(resolvedId, input)}
    />
  )
}
