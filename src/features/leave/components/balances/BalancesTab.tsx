/**
 * HR balances table with filters and ledger detail sheet on row open.
 * Shown on LeavePage Balances tab for HR demo role only.
 */

import { Building2, CalendarCheck, Clock, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import { LeaveStatGrid } from '../LeaveStatGrid'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { BALANCE_TYPE_CODES } from '../../constants/leaveTypeCodes'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { activeEmployees, resolveEmploymentStatus } from '../../utils/employmentStatus'
import { countPendingRequests } from '../../utils/leaveHrMetrics'
import { csvFilename, downloadCsv } from '../../utils/downloadCsv'
import { BALANCE_SUMMARY_HEADERS, balanceSummaryRows } from '../../utils/reportBalanceSummary'
import { EmploymentStatusPill } from '../EmploymentStatusPill'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { BalanceLedgerDialog } from '../dialogs/BalanceLedgerDialog'
import { ApiBalancesTab } from './ApiBalancesTab'

export function BalancesTab() {
  const { snapshot } = useLeave()
  if (snapshot?.api) return <ApiBalancesTab />
  return <DemoBalancesTab />
}

function DemoBalancesTab() {
  const { snapshot } = useLeave()
  const canFetchLeaves = useShouldFetchLeaveList()
  const [search, setSearch] = useState('')
  const [liveSearch, setLiveSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [liveSelectedId, setLiveSelectedId] = useState<string | null>(null)

  const allRows = useMemo(
    () => activeEmployees(snapshot?.employees ?? []).filter((item) => !item.id.startsWith('EMP-HR')),
    [snapshot?.employees],
  )
  const rows = useMemo(
    () => allRows.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [allRows, search],
  )

  if (!snapshot) return null

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Balances"
        subtitle="Employee leave balances and ledger adjustments."
        actions={
          <Button type="button" variant="outline" onClick={() => snapshot && downloadCsv(csvFilename('balances'), BALANCE_SUMMARY_HEADERS, balanceSummaryRows(snapshot))}>
            Download CSV
          </Button>
        }
      />
      <LeaveStatGrid
        items={[
          { label: 'Employees', value: String(rows.length), icon: Building2, tone: 'neutral' },
          { label: 'Pending requests', value: String(countPendingRequests(snapshot)), icon: Clock, tone: 'warning' },
          { label: 'Approved leaves', value: String(snapshot.requests.filter((item) => item.status === 'Approved').length), icon: CalendarCheck, tone: 'success' },
          { label: 'EL pending encashment', value: String(snapshot.encashments.filter((item) => item.status === 'Pending payout').length), icon: Wallet, tone: 'primary' },
        ]}
      />
      {canFetchLeaves ? (
        <BalancesHrOverviewLiveSection
          search={liveSearch}
          onSearchChange={setLiveSearch}
          selectedEmployeeId={liveSelectedId}
          onSelectEmployeeId={setLiveSelectedId}
        />
      ) : null}
      <LeaveTableFilters
        searchId="balances-search"
        searchPlaceholder="Search employees"
        searchValue={search}
        onSearchChange={setSearch}
        showing={rows.length}
        total={allRows.length}
      />
      <Card>
        <CardContent className="min-w-0 overflow-x-auto p-0">
          {rows.length === 0 ? (
            <LeaveEmptyState message="No employees match your search." />
          ) : (
            <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  <th className={leaveThClass('left', 'w-[28%]')}>Employee</th>
                  <th className={leaveThClass('left', 'w-[20%]')}>Department</th>
                  {BALANCE_TYPE_CODES.map((code) => (
                    <th key={code} className={leaveThClass('right', 'w-[10%]')} title={code}>
                      {code}
                    </th>
                  ))}
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
                    <td className={leaveTdClass('left', 'font-normal')}>{row.department}</td>
                    {BALANCE_TYPE_CODES.map((code) => (
                      <td key={code} className={leaveTdClass('right', 'font-normal')}>
                        {ledgerBalanceForType(snapshot.ledger, row.id, code)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <BalanceLedgerDialog open={Boolean(selectedId)} employeeId={selectedId} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  )
}
