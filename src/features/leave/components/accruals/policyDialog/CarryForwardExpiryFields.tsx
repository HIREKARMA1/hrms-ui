import type { CarryForwardPolicyForm } from '../../../utils/buildLeavePolicyApiBody'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { POLICY_DIALOG_INPUT, PolicyToggleRow } from './PolicyDialogShared'

type Props = {
  expiryNever: boolean
  expiryMonths: string
  monthsErr: string | null
  loading?: boolean
  onChange: (patch: Partial<CarryForwardPolicyForm>) => void
  onBlurMonths: () => void
}

export function CarryForwardExpiryFields(props: Props) {
  return (
    <div className="mt-4 space-y-3">
      <PolicyToggleRow
        label="Carried leave never expires"
        description="When off, unused carried days expire after the number of months below."
        checked={props.expiryNever}
        disabled={props.loading}
        onCheckedChange={(expiryNever) => props.onChange({ expiryNever })}
      />
      {!props.expiryNever ? (
        <LeaveDialogField
          label="Expire after (months)"
          htmlFor="cf-months"
          error={props.monthsErr ?? undefined}
          touched={Boolean(props.monthsErr)}
        >
          <input
            id="cf-months"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            className={POLICY_DIALOG_INPUT}
            value={props.expiryMonths}
            disabled={props.loading}
            onChange={(e) => props.onChange({ expiryMonths: e.target.value })}
            onBlur={props.onBlurMonths}
            placeholder="e.g. 3"
          />
        </LeaveDialogField>
      ) : null}
    </div>
  )
}