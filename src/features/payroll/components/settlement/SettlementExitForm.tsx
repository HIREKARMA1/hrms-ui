/**
 * Editable exit details fields on the settlement sheet (Draft only).
 * Used inside SettlementDetailPanel.
 */

import type { ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { FinalSettlement } from '../../types/finalSettlement'
import type { PayrollEmployee } from '../../types/payroll'
import { formatDate } from '../../utils/formatDate'

type SettlementExitFormProps = {
  draft: FinalSettlement
  employees: PayrollEmployee[]
  readOnly: boolean
  dateError: string | null
  onPatch: (patch: Partial<FinalSettlement>) => void
}

export function SettlementExitForm({
  draft,
  employees,
  readOnly,
  dateError,
  onPatch,
}: SettlementExitFormProps) {
  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-hrms-navy">Exit details</h3>
      {readOnly ? <ReadOnlyExit draft={draft} employees={employees} /> : (
        <ExitFields draft={draft} employees={employees} onPatch={onPatch} dateError={dateError} />
      )}
    </section>
  )
}

function ExitFields({
  draft,
  employees,
  onPatch,
  dateError,
}: {
  draft: FinalSettlement
  employees: PayrollEmployee[]
  onPatch: (patch: Partial<FinalSettlement>) => void
  dateError: string | null
}) {
  return (
    <FieldStack>
      <Label htmlFor="fs-employee">Employee</Label>
      <select
        id="fs-employee"
        className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3 text-sm"
        value={draft.employeeId}
        onChange={(e) => onPatch({ employeeId: e.target.value })}
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name} ({employee.id})
          </option>
        ))}
      </select>
      <Label htmlFor="fs-resign">Resignation date</Label>
      <Input id="fs-resign" type="date" value={draft.resignationDate} onChange={(e) => onPatch({ resignationDate: e.target.value })} />
      <Label htmlFor="fs-lwd">Last working day</Label>
      <Input id="fs-lwd" type="date" value={draft.lastWorkingDay} onChange={(e) => onPatch({ lastWorkingDay: e.target.value })} />
      <Label htmlFor="fs-notice-req">Notice days required</Label>
      <Input
        id="fs-notice-req"
        type="number"
        value={draft.noticePeriodDaysRequired}
        onChange={(e) => onPatch({ noticePeriodDaysRequired: Number(e.target.value) })}
      />
      <Label htmlFor="fs-notice-served">Notice days served</Label>
      <Input
        id="fs-notice-served"
        type="number"
        value={draft.noticeDaysServed}
        onChange={(e) => onPatch({ noticeDaysServed: Number(e.target.value) })}
      />
      {dateError ? <p className="text-sm text-hrms-danger">{dateError}</p> : null}
    </FieldStack>
  )
}

function FieldStack({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ReadOnlyExit({ draft, employees }: { draft: FinalSettlement; employees: PayrollEmployee[] }) {
  const name = employees.find((item) => item.id === draft.employeeId)?.name ?? draft.employeeId
  return (
    <div className="space-y-1 text-hrms-text-secondary">
      <p>{name} · {draft.employeeId}</p>
      <p>Resignation {formatDate(draft.resignationDate)}</p>
      <p>Last working day {formatDate(draft.lastWorkingDay)}</p>
      <p>Notice {draft.noticeDaysServed} / {draft.noticePeriodDaysRequired} days</p>
    </div>
  )
}
