/**
 * Server Accruals & Year-End tab: policy lists plus accrual, carry-forward and
 * expiry runs (leave_policies:run).
 */

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { isDateOnly } from '../../api/leaveMappers'
import { useApiAccrualPolicyCreates } from '../../hooks/useApiAccrualPolicyCreates'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveApiActions, type LeaveRunResult } from '../../hooks/useLeaveApiActions'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LEAVE_FIELD_LABEL, LEAVE_FILTER_SELECT } from '../shared/leaveUi'
import { AccrualRunCard, AccrualYearSelect } from './AccrualRunCards'
import type { AccrualRunFeedback } from './AccrualRunResultStrip'
import { accrualRunDialogCopy, type AccrualPendingRun } from './accrualRunDialogCopy'
import { ApiAccrualPolicyDialog } from './ApiAccrualPolicyDialog'
import { ApiAccrualPoliciesCard, ApiCarryForwardPoliciesCard } from './ApiPolicyTables'
import { ApiCarryForwardPolicyDialog } from './ApiCarryForwardPolicyDialog'
import { ApiEncashmentPoliciesCard } from './ApiEncashmentPoliciesCard'
import { ApiEncashmentPolicyDialog } from './ApiEncashmentPolicyDialog'
import { useApiEncashmentPolicyCreates } from '../../hooks/useApiEncashmentPolicyCreates'

const RUN_TOAST_OK: Record<AccrualPendingRun, string> = {
  accrual: 'Accrual run finished.',
  carryForward: 'Carry-forward run finished.',
  expire: 'Expiry run finished.',
}

export function ApiAccrualsTab({ openAccrualConfirm = false }: { openAccrualConfirm?: boolean }) {
  const { snapshot } = useLeave()
  const permissions = useLeavePermissions()
  const actions = useLeaveApiActions()
  const { showToast } = useLeaveToast()
  const creates = useApiAccrualPolicyCreates()
  const encashmentCreates = useApiEncashmentPolicyCreates()

  const leaveTypes = snapshot?.api?.leaveTypes ?? []
  const canManagePolicies = permissions.canRunAccrual
  const canManageEncashmentPolicies = permissions.canRequestEncashment
  const today = leaveTodayIso()
  const currentYear = Number(today.slice(0, 4))
  const [asOfDate, setAsOfDate] = useState(today)
  const [fromYear, setFromYear] = useState(currentYear - 1)
  const [expireYear, setExpireYear] = useState(currentYear)
  const [pending, setPending] = useState<AccrualPendingRun | null>(
    openAccrualConfirm && permissions.canRunAccrual ? 'accrual' : null,
  )
  const [saving, setSaving] = useState(false)
  const [runFeedback, setRunFeedback] = useState<Partial<Record<AccrualPendingRun, AccrualRunFeedback>>>({})
  const years = [currentYear - 2, currentYear - 1, currentYear]

  async function confirm(run: AccrualPendingRun) {
    setSaving(true)
    let result: LeaveRunResult
    if (run === 'accrual') result = await actions.runAccrual({ asOfDate })
    else if (run === 'carryForward') result = await actions.runCarryForward({ fromYear })
    else result = await actions.expireCarryForward({ year: expireYear })
    setSaving(false)
    setPending(null)
    const message = result.ok ? result.summary : result.message
    setRunFeedback((prev) => ({
      ...prev,
      [run]: { ok: result.ok, message },
    }))
    showToast(result.ok ? RUN_TOAST_OK[run] : message)
  }

  const runCopy = pending ? accrualRunDialogCopy(pending, asOfDate, fromYear, expireYear) : null

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Accruals & year-end" subtitle="Server accrual and carry-forward policies, and policy runs." />
      {permissions.canRunAccrual ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <AccrualRunCard
            title="Accrual run"
            button="Run accrual"
            disabled={!isDateOnly(asOfDate)}
            runFeedback={runFeedback.accrual}
            onRun={() => setPending('accrual')}
          >
            <span className={LEAVE_FIELD_LABEL}>As of date</span>
            <input
              type="date"
              className={cn('mt-1', LEAVE_FILTER_SELECT, 'w-full')}
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
            />
          </AccrualRunCard>
          <AccrualRunCard
            title="Carry-forward"
            button="Run carry-forward"
            runFeedback={runFeedback.carryForward}
            onRun={() => setPending('carryForward')}
          >
            <span className={LEAVE_FIELD_LABEL}>From year</span>
            <AccrualYearSelect value={fromYear} years={years} onChange={setFromYear} />
          </AccrualRunCard>
          <AccrualRunCard
            title="Carry-forward expiry"
            button="Expire carried leave"
            outline
            runFeedback={runFeedback.expire}
            onRun={() => setPending('expire')}
          >
            <span className={LEAVE_FIELD_LABEL}>Year</span>
            <AccrualYearSelect value={expireYear} years={years} onChange={setExpireYear} />
          </AccrualRunCard>
        </div>
      ) : null}
      <ApiAccrualPoliciesCard
        canManage={canManagePolicies}
        onAdd={canManagePolicies ? () => creates.openCreate('accrual') : undefined}
      />
      <ApiCarryForwardPoliciesCard
        canManage={canManagePolicies}
        onAdd={canManagePolicies ? () => creates.openCreate('carryForward') : undefined}
      />
      <ApiEncashmentPoliciesCard
        canManage={canManageEncashmentPolicies}
        onAdd={canManageEncashmentPolicies ? encashmentCreates.openCreate : undefined}
      />
      <ApiAccrualPolicyDialog
        open={creates.createDialog === 'accrual'}
        leaveTypes={leaveTypes}
        saveError={creates.createDialog === 'accrual' ? creates.policySaveError : null}
        loading={creates.policyBusy}
        onOpenChange={(open) => !open && creates.closeCreate()}
        onSubmit={(body) => void creates.submitAccrualPolicy(body)}
      />
      <ApiCarryForwardPolicyDialog
        open={creates.createDialog === 'carryForward'}
        leaveTypes={leaveTypes}
        defaultYear={currentYear}
        saveError={creates.createDialog === 'carryForward' ? creates.policySaveError : null}
        loading={creates.policyBusy}
        onOpenChange={(open) => !open && creates.closeCreate()}
        onSubmit={(body) => void creates.submitCarryForwardPolicy(body)}
      />
      <ApiEncashmentPolicyDialog
        open={encashmentCreates.open}
        leaveTypes={leaveTypes}
        saveError={encashmentCreates.saveError}
        loading={encashmentCreates.busy}
        onOpenChange={(open) => !open && encashmentCreates.closeCreate()}
        onClearSaveError={encashmentCreates.clearSaveError}
        onSubmit={(body) => void encashmentCreates.submitPolicy(body)}
      />
      {pending && runCopy ? (
        <LeaveConfirmDialog
          open
          onOpenChange={(open) => !open && !saving && setPending(null)}
          title={runCopy.title}
          description={runCopy.description}
          confirmLabel={runCopy.label}
          loading={saving}
          danger={pending === 'expire'}
          onConfirm={() => void confirm(pending)}
        />
      ) : null}
    </div>
  )
}