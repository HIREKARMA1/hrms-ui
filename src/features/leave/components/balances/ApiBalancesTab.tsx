/**
 * Server Balances tab: directory employees, with each employee's balance
 * loaded on open. Balances for other employees are only readable org-wide
 * with leaves:create_on_behalf; otherwise the server limits them to the
 * caller's own employee or department, which need a linked employee record.
 */

import { useMemo, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { resolveEmploymentStatus } from '../../utils/employmentStatus'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { EmploymentStatusPill } from '../EmploymentStatusPill'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveServerNotice } from '../shared/LeaveServerNotice'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'
import { ApiBalanceDialog } from './ApiBalanceDialog'

export function ApiBalancesTab() {
  const { snapshot } = useLeave()
  const permissions = useLeavePermissions()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const employees = useMemo(() => snapshot?.employees ?? [], [snapshot?.employees])
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return needle ? employees.filter((item) => item.name.toLowerCase().includes(needle)) : employees
  }, [employees, search])

  const api = snapshot?.api
  if (!snapshot || !api) return null
  const selected = employees.find((item) => item.id === selectedId)
  const currentYear = Number(leaveTodayIso().slice(0, 4))

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Balances" subtitle="Leave balances from the server. Open an employee to see their balances." />
      {!permissions.canCreateOnBehalf ? (
        <LeaveServerNotice>
          Viewing other employees&apos; balances needs the permission to apply leave on behalf of employees.
        </LeaveServerNotice>
      ) : !api.access.employeeDirectory ? (
        <LeaveServerNotice>Listing employees needs access to the employee directory.</LeaveServerNotice>
      ) : (
        <>
          <LeaveTableFilters searchId="api-balances-search" searchPlaceholder="Search employees" searchValue={search} onSearchChange={setSearch} showing={rows.length} total={employees.length} />
          <Card>
            <CardContent className="min-w-0 overflow-x-auto p-0">
              {rows.length === 0 ? (
                <LeaveEmptyState message={employees.length === 0 ? 'No employees were returned by the directory.' : 'No employees match your search.'} />
              ) : (
                <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
                  <thead className={LEAVE_TABLE_THEAD}>
                    <tr>
                      <th className={leaveThClass('left', 'w-[45%]')}>Employee</th>
                      <th className={leaveThClass('left', 'w-[35%]')}>Department</th>
                      <th className={leaveThClass('right', 'w-[20%]')}>Balances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className={LEAVE_TABLE_ROW}
                        tabIndex={0}
                        onClick={() => setSelectedId(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setSelectedId(row.id)
                          }
                        }}
                      >
                        <td className={leaveTdClass('left')}>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span>{row.name}</span>
                            <EmploymentStatusPill status={resolveEmploymentStatus(row, snapshot.requests)} />
                          </div>
                        </td>
                        <td className={leaveTdClass('left', 'font-normal')}>{row.department || '—'}</td>
                        <td className={leaveTdClass('right', 'font-normal text-hrms-primary')}>View</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {selected ? (
        <ApiBalanceDialog
          key={selected.id}
          employeeId={selected.id}
          employeeName={selected.name}
          currentYear={currentYear}
          leaveTypes={api.leaveTypes}
          onOpenChange={(open) => !open && setSelectedId(null)}
        />
      ) : null}
    </div>
  )
}
