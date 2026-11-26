import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { CarryForwardPolicyForm } from '../../../utils/buildLeavePolicyApiBody'
import { CarryForwardRulesFields } from './CarryForwardRulesFields'
import { PolicyFormSection, PolicyToggleRow } from './PolicyDialogShared'

type Touched = { leaveType: boolean; max: boolean; year: boolean; months: boolean }

type Props = {
  form: CarryForwardPolicyForm
  loading?: boolean
  activeTypes: LeaveTypeOption[]
  touched: Touched
  typeErr: string | null
  maxErr: string | null
  yearErr: string | null
  monthsErr: string | null
  setForm: (patch: Partial<CarryForwardPolicyForm>) => void
  setTouched: (patch: Partial<Touched>) => void
}

export function CarryForwardPolicyFormBody(props: Props) {
  return (
    <>
      <CarryForwardRulesFields
        form={props.form}
        loading={props.loading}
        activeTypes={props.activeTypes}
        touched={props.touched}
        typeErr={props.typeErr}
        maxErr={props.maxErr}
        yearErr={props.yearErr}
        monthsErr={props.monthsErr}
        setForm={props.setForm}
        setTouched={props.setTouched}
      />
      <PolicyFormSection title="Status">
        <PolicyToggleRow
          label="Carry-forward enabled"
          description="When disabled, year-end runs skip this leave type."
          checked={props.form.enabled}
          disabled={props.loading}
          onCheckedChange={(enabled) => props.setForm({ enabled })}
        />
        <div className="mt-3">
          <PolicyToggleRow
            label="Active policy"
            description="Inactive policies remain visible but are ignored by runs."
            checked={props.form.isActive}
            disabled={props.loading}
            onCheckedChange={(isActive) => props.setForm({ isActive })}
          />
        </div>
      </PolicyFormSection>
    </>
  )
}