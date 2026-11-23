/**
 * Server Accruals & Year-End tab: policy lists plus accrual, carry-forward and
 * expiry runs (leave_policies:run). The server skips duplicate runs, so a
 * repeated run reports skipped rows instead of posting twice.
 */

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { isDateOnly } from '../../api/leaveMappers'
import { useLeaveApiActions, type LeaveRunResult } from '../../hooks/useLeaveApiActions'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LEAVE_FIELD_LABEL, LEAVE_FILTER_SELECT, LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { ApiAccrualPoliciesCard, ApiCarryForwardPoliciesCard } from './ApiPolicyTables'

type PendingRun = 'accrual' | 'carryForward' | 'expire'

export function ApiAccrualsTab({ openAccrualConfirm = false }: { openAccrualConfirm?: boolean }) {
  const permissions = useLeavePermissions()
  const actions = useLeaveApiActions()
  const { showToast } = useLeaveToast()
  const today = leaveTodayIso()
  const currentYear = Number(today.slice(0, 4))
  const [asOfDate, setAsOfDate] = useState(today)
  const [fromYear, setFromYear] = useState(currentYear - 1)
  const [expireYear, setExpireYear] = useState(currentYear)
  const [pending, setPending] = useState<PendingRun | null>(openAccrualConfirm && permissions.canRunAccrual ? 'accrual' : null)
  const [saving, setSaving] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const years = [currentYear - 2, currentYear - 1, currentYear]

  async function confirm(run: PendingRun) {
    setSaving(true)
    let result: LeaveRunResult
    if (run === 'accrual') result = await actions.runAccrual({ asOfDate })
    else if (run === 'carryForward') result = await actions.runCarryForward({ fromYear })
    else result = await actions.expireCarryForward({ year: expireYear })
    setSaving(false)
    setPending(null)
    const message = result.ok ? result.summary : result.message
    setLastResult(message)
    showToast(message)
  }

  const dialogs: Record<PendingRun, { title: string; description: string; label: string }> = {
    accrual: {
      title: 'Run accrual?',
      description: `Posts accrual credits as of ${asOfDate} for every eligible employee under the active accrual policies.`,
      label: 'Run accrual',
    },
    carryForward: {
      title: 'Run carry-forward?',
      description: `Carries unused ${fromYear} balances into ${fromYear + 1} under the carry-forward policies.`,
      label: 'Run carry-forward',
    },
    expire: {
      title: 'Expire carried-forward leave?',
      description: `Expires carried-forward days in ${expireYear} that are past their policy expiry.`,
      label: 'Expire',
    },
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Accruals & year-end" subtitle="Server accrual and carry-forward policies, and policy runs." />
      {lastResult ? (
        <p role="status" className="rounded-xl border border-hrms-border bg-white px-4 py-3 text-sm text-hrms-navy">
          {lastResult}
        </p>
      ) : null}
      {permissions.canRunAccrual ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <RunCard title="Accrual run" button="Run accrual" disabled={!isDateOnly(asOfDate)} onRun={() => setPending('accrual')}>
            <span className={LEAVE_FIELD_LABEL}>As of date</span>
            <input type="date" className={cn('mt-1', LEAVE_FILTER_SELECT, 'w-full')} value={asOfDate} onChange={(event) => setAsOfDate(event.target.value)} />
          </RunCard>
          <RunCard title="Carry-forward" button="Run carry-forward" onRun={() => setPending('carryForward')}>
            <span className={LEAVE_FIELD_LABEL}>From year</span>
            <YearSelect value={fromYear} years={years} onChange={setFromYear} />
          </RunCard>
          <RunCard title="Carry-forward expiry" button="Expire carried leave" outline onRun={() => setPending('expire')}>
            <span className={LEAVE_FIELD_LABEL}>Year</span>
            <YearSelect value={expireYear} years={years} onChange={setExpireYear} />
          </RunCard>
        </div>
      ) : null}
      <ApiAccrualPoliciesCard />
      <ApiCarryForwardPoliciesCard />
      {pending ? (
        <LeaveConfirmDialog
          open
          onOpenChange={(open) => !open && !saving && setPending(null)}
          title={dialogs[pending].title}
          description={dialogs[pending].description}
          confirmLabel={dialogs[pending].label}
          loading={saving}
          danger={pending === 'expire'}
          onConfirm={() => void confirm(pending)}
        />
      ) : null}
    </div>
  )
}

function RunCard({ title, button, onRun, disabled, outline, children }: {
  title: string
  button: string
  onRun: () => void
  disabled?: boolean
  outline?: boolean
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5 text-sm">
        <label className="block">{children}</label>
        <Button type="button" variant={outline ? 'outline' : 'default'} className={outline ? LEAVE_SECONDARY_BUTTON : undefined} disabled={disabled} onClick={onRun}>
          {button}
        </Button>
      </CardContent>
    </Card>
  )
}

function YearSelect({ value, years, onChange }: { value: number; years: number[]; onChange: (year: number) => void }) {
  return (
    <select className={cn('mt-1', LEAVE_FILTER_SELECT, 'w-full')} value={value} onChange={(event) => onChange(Number(event.target.value))}>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}
