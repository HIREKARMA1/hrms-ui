/**
 * HR monthly accrual and year-end preview with confirm dialogs and toasts.
 * Shown on LeavePage Accruals & Year-End tab.
 */

import { useState } from 'react'
import { activeEmployees } from '../../utils/employmentStatus'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { calculateAccrualPreview } from '../../utils/calculateAccrual'
import { calculateYearEndPreview } from '../../utils/calculateYearEnd'
import { hasAccrualRun, recordAccrualRun } from '../../services/leaveService'
import { appendLedger } from '../../services/requestActions'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LEAVE_FIELD_LABEL, LEAVE_FILTER_SELECT, LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { AccrualPoliciesLiveTable } from './AccrualPoliciesLiveTable'
import { AccrualsTabStats } from './AccrualsTabStats'
import { CarryForwardPoliciesLiveTable } from './CarryForwardPoliciesLiveTable'
import { EncashmentPoliciesLiveTable } from './EncashmentPoliciesLiveTable'

export function AccrualsTab({ openAccrualConfirm = false }: { openAccrualConfirm?: boolean }) {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const permissions = useLeavePermissions()
  const [yearMonth, setYearMonth] = useState(leaveTodayIso().slice(0, 7))
  const [confirmAccrual, setConfirmAccrual] = useState(openAccrualConfirm)
  const [confirmYearEnd, setConfirmYearEnd] = useState(false)
  const [saving, setSaving] = useState(false)

  const employees = activeEmployees(snapshot?.employees ?? []).filter((item) => !item.id.startsWith('EMP-HR'))
  const accrualPreview = snapshot ? calculateAccrualPreview(snapshot.settings, employees, yearMonth) : []
  const yearEndPreview = snapshot
    ? calculateYearEndPreview(
        snapshot.settings,
        snapshot.ledger,
        employees.map((item) => item.id),
      )
    : []

  if (!snapshot) return null

  async function runAccrual() {
    if (hasAccrualRun(yearMonth)) {
      showToast(`Accrual for ${yearMonth} was already run.`)
      setConfirmAccrual(false)
      return
    }
    setSaving(true)
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
    recordAccrualRun(yearMonth)
    await reload()
    setSaving(false)
    setConfirmAccrual(false)
    showToast(`Accrual posted for ${yearMonth}.`)
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Accruals & year-end" subtitle="Preview and post monthly accruals and year-end carry-forward." />
      <AccrualsTabStats
        employeeCount={employees.length}
        accrualLines={accrualPreview.length}
        yearEndLines={yearEndPreview.length}
        accrualMonth={yearMonth}
      />
      <AccrualPoliciesLiveTable />
      <Card>
        <CardHeader className="border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Monthly accrual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 text-sm">
          <label className="block">
            <span className={LEAVE_FIELD_LABEL}>Accrual month</span>
            <input type="month" className={cn('mt-1', LEAVE_FILTER_SELECT, 'w-full max-w-xs')} value={yearMonth} onChange={(event) => setYearMonth(event.target.value)} />
          </label>
          <p className="text-hrms-text-secondary tabular-nums">{accrualPreview.length} ledger credits in preview.</p>
          {permissions.canRunAccrual ? <Button type="button" onClick={() => setConfirmAccrual(true)}>Run accrual</Button> : null}
        </CardContent>
      </Card>
      <CarryForwardPoliciesLiveTable />
      <EncashmentPoliciesLiveTable />
      <Card>
        <CardHeader className="border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Year-end preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 text-sm">
          <p className="text-hrms-text-secondary">{yearEndPreview.length} employee/type adjustments ({snapshot.settings.leaveYearMode}).</p>
          {/* Carry-forward runs share the backend `leave_policies:run` code with accruals. */}
          {permissions.canRunAccrual ? (
            <Button type="button" variant="outline" className={LEAVE_SECONDARY_BUTTON} onClick={() => setConfirmYearEnd(true)}>
              Run year-end
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <LeaveConfirmDialog open={confirmAccrual && permissions.canRunAccrual} onOpenChange={setConfirmAccrual} title="Run monthly accrual?" description="This will post accrual ledger rows for all eligible employees for the selected month." confirmLabel="Run accrual" loading={saving} onConfirm={() => void runAccrual()} />
      <LeaveConfirmDialog open={confirmYearEnd} onOpenChange={setConfirmYearEnd} title="Run year-end?" description="Year-end will apply carry-forward rules from settings. Review preview before confirming in production." confirmLabel="Run year-end" onConfirm={() => { setConfirmYearEnd(false); showToast('Year-end run saved (preview only).'); }} />
    </div>
  )
}
