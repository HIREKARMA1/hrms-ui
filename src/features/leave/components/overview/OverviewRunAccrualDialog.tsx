/**
 * Monthly accrual confirmation opened from HR Overview quick actions.
 */

import { useState } from 'react'

import { useLeave } from '../../hooks/useLeave'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { calculateAccrualPreview } from '../../utils/calculateAccrual'
import { activeEmployees } from '../../utils/employmentStatus'
import { getLeaveStore } from '../../services/mockLeaveStore'
import { appendLedger } from '../../services/requestActions'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export function OverviewRunAccrualDialog({ open, onOpenChange }: Props) {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const [saving, setSaving] = useState(false)
  if (!snapshot) return null
  const yearMonth = leaveTodayIso().slice(0, 7)
  const employees = activeEmployees(snapshot.employees).filter((item) => !item.id.startsWith('EMP-HR'))
  const preview = calculateAccrualPreview(snapshot.settings, employees, yearMonth)

  async function runAccrual() {
    const store = getLeaveStore()
    if (store.accrualRuns.includes(yearMonth)) {
      showToast(`Accrual for ${yearMonth} was already run.`)
      onOpenChange(false)
      return
    }
    setSaving(true)
    for (const row of preview) {
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
    await reload()
    setSaving(false)
    onOpenChange(false)
    showToast(`Accrual posted for ${yearMonth}.`)
  }

  return (
    <LeaveConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Run monthly accrual?"
      description="This posts accrual ledger rows for all eligible employees for the current month."
      confirmLabel="Run accrual"
      loading={saving}
      onConfirm={() => void runAccrual()}
    />
  )
}
