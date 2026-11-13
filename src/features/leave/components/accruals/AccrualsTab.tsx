/**
 * HR monthly accrual and year-end preview runs with duplicate-month guard.
 * Shown on LeavePage Accruals & Year-End tab.
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { useLeave } from '../../hooks/useLeave'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { calculateAccrualPreview } from '../../utils/calculateAccrual'
import { calculateYearEndPreview } from '../../utils/calculateYearEnd'
import { getLeaveStore } from '../../services/mockLeaveStore'
import { appendLedger } from '../../services/requestActions'
import { leaveTodayIso } from '../../utils/leaveToday'

export function AccrualsTab() {
  const { snapshot, reload } = useLeave()
  const [yearMonth, setYearMonth] = useState(leaveTodayIso().slice(0, 7))
  const [message, setMessage] = useState('')
  if (!snapshot) {
    return null
  }
  const employees = snapshot.employees.filter((item) => !item.id.startsWith('EMP-HR'))
  const accrualPreview = calculateAccrualPreview(snapshot.settings, employees, yearMonth)
  const yearEndPreview = calculateYearEndPreview(
    snapshot.settings,
    snapshot.ledger,
    employees.map((item) => item.id),
  )

  async function runAccrual() {
    const store = getLeaveStore()
    if (store.accrualRuns.includes(yearMonth)) {
      setMessage(`Accrual for ${yearMonth} was already run.`)
      return
    }
    for (const row of accrualPreview) {
      appendLedger({
        employeeId: row.employeeId,
        leaveTypeCode: row.leaveTypeCode,
        date: `${yearMonth}-28`,
        kind: 'Accrual',
        days: row.days,
        balanceAfter: row.days,
        reason: `Accrual ${yearMonth}`,
        by: 'System',
      })
    }
    store.accrualRuns.push(yearMonth)
    setMessage(`Accrual posted for ${yearMonth}.`)
    await reload()
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Accruals & year-end" subtitle="Preview and post monthly accruals and year-end carry-forward." />
      <Card>
        <CardContent className="space-y-3 p-5 text-sm">
          <label className="flex flex-wrap items-center gap-2">
            Accrual month
            <input type="month" className="h-9 rounded-lg border border-hrms-border px-2" value={yearMonth} onChange={(event) => setYearMonth(event.target.value)} />
          </label>
          <p>{accrualPreview.length} ledger credits in preview.</p>
          <Button type="button" onClick={() => void runAccrual()}>
            Run accrual
          </Button>
          {message ? <p className="text-hrms-warning">{message}</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-5 text-sm">
          <p className="font-semibold text-hrms-navy">Year-end preview ({snapshot.settings.leaveYearMode})</p>
          <p>{yearEndPreview.length} employee/type adjustments in preview.</p>
          <Button type="button" variant="outline">
            Run year-end
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
