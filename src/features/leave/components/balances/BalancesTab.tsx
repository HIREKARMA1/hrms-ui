/**
 * HR balances table with employee row drill-down to ledger sheet.
 * Shown on LeavePage Balances tab for HR demo role only.
 */

import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useLeave } from '../../hooks/useLeave'
import { LeaveStatGrid } from '../LeaveStatGrid'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { BALANCE_TYPE_CODES } from '../../constants/leaveTypeCodes'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { BalanceDetailSheet } from './BalanceDetailSheet'

export function BalancesTab() {
  const { snapshot } = useLeave()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (!snapshot) {
    return null
  }
  const rows = snapshot.employees
    .filter((item) => !item.id.startsWith('EMP-HR'))
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Balances" subtitle="Employee leave balances and ledger adjustments." />
      <LeaveStatGrid
        items={[
          { label: 'Employees', value: String(rows.length) },
          { label: 'Pending requests', value: String(snapshot.requests.filter((item) => item.status === 'Pending').length) },
          { label: 'On leave today', value: String(snapshot.requests.filter((item) => item.status === 'Approved').length) },
          { label: 'EL pending encashment', value: String(snapshot.encashments.filter((item) => item.status === 'Pending payout').length) },
        ]}
      />
      <Input placeholder="Search employees" value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-md" />
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-hrms-page text-hrms-text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                {BALANCE_TYPE_CODES.map((code) => (
                  <th key={code} className="px-4 py-3 font-semibold">
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-hrms-border/60 hover:bg-hrms-row-hover"
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.department}</td>
                  {BALANCE_TYPE_CODES.map((code) => (
                    <td key={code} className="px-4 py-3 tabular-nums">
                      {ledgerBalanceForType(snapshot.ledger, row.id, code)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <BalanceDetailSheet
        open={Boolean(selectedId)}
        employeeId={selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  )
}
