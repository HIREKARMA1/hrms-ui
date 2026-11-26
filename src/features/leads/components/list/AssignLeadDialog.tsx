/**
 * Pick an employee and assign a lead (PATCH /leads/:id/assign).
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { EMPLOYEE_MAX_TAKE, useListEmployeesQuery } from '@/features/employees/api/employeesApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { cn } from '@/lib/utils'

import { useLeads } from '../../hooks/useLeads'
import type { Lead } from '../../types/lead'
import {
  LEADS_DIALOG_HEADER_BAND,
  LEADS_DIALOG_SHELL,
} from '../shared/leadsUi'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '@/features/payroll/components/shared/PayrollDialog'

type AssignLeadDialogProps = {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const selectClass =
  'mt-1 h-10 w-full rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export function AssignLeadDialog({ lead, open, onOpenChange }: AssignLeadDialogProps) {
  const { assignLead } = useLeads()
  const { user } = useAuthenticatedUser()
  const canListEmployees = Boolean(user?.permissions?.includes('employees:read'))
  const [employeeId, setEmployeeId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: employeesPage, isLoading } = useListEmployeesQuery(
    { skip: 0, take: EMPLOYEE_MAX_TAKE },
    { skip: !open || !canListEmployees },
  )

  const assignees = useMemo(() => {
    const rows = (employeesPage?.items ?? []).map((item) => ({
      id: item.server.id,
      name: `${item.profile.firstName} ${item.profile.lastName}`.trim() || item.server.employeeCode,
    }))
    if (user?.employeeId && !rows.some((row) => row.id === user.employeeId)) {
      rows.unshift({ id: user.employeeId, name: 'Me' })
    }
    if (
      lead?.assignedEmployeeId &&
      lead.assignedEmployeeName &&
      !rows.some((row) => row.id === lead.assignedEmployeeId)
    ) {
      rows.unshift({
        id: lead.assignedEmployeeId,
        name: lead.assignedEmployeeName,
      })
    }
    return rows
  }, [
    employeesPage?.items,
    user?.employeeId,
    lead?.assignedEmployeeId,
    lead?.assignedEmployeeName,
  ])

  async function handleAssign() {
    if (!lead || !employeeId) {
      setError('Select an employee to assign.')
      return
    }
    if (employeeId === lead.assignedEmployeeId) {
      onOpenChange(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await assignLead(lead.id, employeeId)
      onOpenChange(false)
      setEmployeeId('')
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Could not assign lead.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PayrollDialogRoot
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          setEmployeeId('')
          setError(null)
        }
      }}
    >
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="sm"
          className={cn('flex max-h-[min(90vh,420px)] flex-col p-0', LEADS_DIALOG_SHELL)}
        >
          <div className={LEADS_DIALOG_HEADER_BAND}>
            <PayrollDialogHeader
              title="Assign lead"
              description={
                lead
                  ? `Choose an owner for ${lead.companyName.trim() || lead.leadName}.`
                  : 'Choose an employee to own this lead.'
              }
            />
          </div>
          <PayrollDialogBody className="space-y-3">
            {error ? <p className="text-sm text-hrms-danger">{error}</p> : null}
            {lead?.assignedEmployeeName ? (
              <p className="text-sm text-hrms-text-secondary">
                Current owner: <span className="font-medium text-hrms-navy">{lead.assignedEmployeeName}</span>
              </p>
            ) : (
              <p className="text-sm text-hrms-text-secondary">Currently unassigned.</p>
            )}
            <div>
              <Label htmlFor="assign-employee">Employee</Label>
              <select
                id="assign-employee"
                className={selectClass}
                value={employeeId}
                disabled={isLoading || saving}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">{isLoading ? 'Loading…' : 'Select employee'}</option>
                {assignees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {!canListEmployees && assignees.length <= 1 ? (
                <p className="mt-1 text-xs text-hrms-text-muted">
                  Full employee directory needs employees:read. You can still assign to yourself if linked.
                </p>
              ) : null}
            </div>
          </PayrollDialogBody>
          <PayrollDialogFooter>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" disabled={saving || !employeeId} onClick={() => void handleAssign()}>
                {saving ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}
