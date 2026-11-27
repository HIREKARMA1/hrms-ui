import { cn } from '@/lib/utils'

import type { BackendAccrualFrequency } from '../../../api/leaveApi.types'
import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { AccrualPolicyForm } from '../../../utils/buildLeavePolicyApiBody'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { LEAVE_FILTER_SELECT, LEAVE_SETTINGS_NUMBER_INPUT } from '../../shared/leaveUi'
import { PolicyFormSection } from './PolicyDialogShared'

type Props = {
  form: AccrualPolicyForm
  loading?: boolean
  activeTypes: LeaveTypeOption[]
  touched: { leaveType: boolean; amount: boolean }
  typeErr: string | null
  amountErr: string | null
  setForm: (patch: Partial<AccrualPolicyForm>) => void
  setTouched: (patch: Partial<Props['touched']>) => void
}

export function AccrualPolicyTypeScheduleFields(props: Props) {
  const { form, loading, activeTypes, touched, typeErr, amountErr, setForm, setTouched } = props
  return (
    <PolicyFormSection title="Leave type & schedule">
      <LeaveDialogField label="Leave type" htmlFor="ap-type" required error={typeErr ?? undefined} touched={touched.leaveType}>
        <select
          id="ap-type"
          className={cn(LEAVE_FILTER_SELECT, 'w-full')}
          value={form.leaveTypeId}
          disabled={loading}
          onChange={(e) => setForm({ leaveTypeId: e.target.value })}
          onBlur={() => setTouched({ leaveType: true })}
        >
          <option value="">Select type…</option>
          {activeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.code})
            </option>
          ))}
        </select>
      </LeaveDialogField>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <LeaveDialogField label="Frequency" htmlFor="ap-freq">
          <select
            id="ap-freq"
            className={cn(LEAVE_FILTER_SELECT, 'w-full')}
            value={form.frequency}
            disabled={loading}
            onChange={(e) => setForm({ frequency: e.target.value as BackendAccrualFrequency })}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </LeaveDialogField>
        <LeaveDialogField label="Accrual amount" htmlFor="ap-amount" required error={amountErr ?? undefined} touched={touched.amount}>
          <input
            id="ap-amount"
            type="number"
            min={0}
            step={0.01}
            inputMode="decimal"
            className={LEAVE_SETTINGS_NUMBER_INPUT}
            value={form.accrualAmount}
            disabled={loading}
            onChange={(e) => setForm({ accrualAmount: e.target.value })}
            onBlur={() => setTouched({ amount: true })}
            placeholder="e.g. 1.5"
          />
        </LeaveDialogField>
      </div>
    </PolicyFormSection>
  )
}