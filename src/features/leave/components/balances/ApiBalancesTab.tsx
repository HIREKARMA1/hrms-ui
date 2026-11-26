/**
 * Server Balances tab: hr-overview table and per-employee policy / balance dialog.
 */

import { useMemo, useState } from 'react'

import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveServerNotice } from '../shared/LeaveServerNotice'
import { ApiBalanceDialog } from './ApiBalanceDialog'
import { BalancesHrOverviewLiveSection } from './BalancesHrOverviewLiveSection'

export function ApiBalancesTab() {
  const { snapshot } = useLeave()
  const permissions = useLeavePermissions()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDisplayName, setSelectedDisplayName] = useState<string | null>(null)

  const employees = useMemo(() => snapshot?.employees ?? [], [snapshot?.employees])
  const nameById = useMemo(() => {
    const map = new Map(employees.map((item) => [item.id, item.name]))
    return (id: string) => map.get(id) ?? id
  }, [employees])
  const api = snapshot?.api
  if (!snapshot || !api) return null

  const selected = employees.find((item) => item.id === selectedId)
  const currentYear = Number(leaveTodayIso().slice(0, 4))

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Balances"
        subtitle="See organization-wide balances, then open an employee to manage policies, adjustments, and history."
      />
      {!permissions.canViewPolicyDefaults ? (
        <LeaveServerNotice>You need employee leave policy read permission to load balances.</LeaveServerNotice>
      ) : (
        <BalancesHrOverviewLiveSection
          search={search}
          onSearchChange={setSearch}
          selectedEmployeeId={selectedId}
          snapshotEmployees={employees}
          orgLeaveTypes={api.leaveTypes}
          onSelectEmployee={(employeeId, displayName) => {
            setSelectedId(employeeId)
            setSelectedDisplayName(displayName ?? null)
          }}
        />
      )}
      {selected ? (
        <ApiBalanceDialog
          key={selected.id}
          employeeId={selected.id}
          employeeName={selected.name}
          currentYear={currentYear}
          leaveTypes={api.leaveTypes}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedId(null)
              setSelectedDisplayName(null)
            }
          }}
        />
      ) : selectedId ? (
        <ApiBalanceDialog
          key={selectedId}
          employeeId={selectedId}
          employeeName={selectedDisplayName ?? nameById(selectedId)}
          currentYear={currentYear}
          leaveTypes={api.leaveTypes}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedId(null)
              setSelectedDisplayName(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}