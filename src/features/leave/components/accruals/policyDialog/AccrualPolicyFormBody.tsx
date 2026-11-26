import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { AccrualPolicyForm } from '../../../utils/buildLeavePolicyApiBody'
import { AccrualPolicyLimitsDatesFields } from './AccrualPolicyLimitsDatesFields'
import { AccrualPolicyTypeScheduleFields } from './AccrualPolicyTypeScheduleFields'

type Touched = { leaveType: boolean; amount: boolean; from: boolean }

type Props = {
  form: AccrualPolicyForm
  loading?: boolean
  activeTypes: LeaveTypeOption[]
  touched: Touched
  typeErr: string | null
  amountErr: string | null
  fromErr: string | null
  setForm: (patch: Partial<AccrualPolicyForm>) => void
  setTouched: (patch: Partial<Touched>) => void
}

export function AccrualPolicyFormBody(props: Props) {
  return (
    <>
      <AccrualPolicyTypeScheduleFields
        form={props.form}
        loading={props.loading}
        activeTypes={props.activeTypes}
        touched={{ leaveType: props.touched.leaveType, amount: props.touched.amount }}
        typeErr={props.typeErr}
        amountErr={props.amountErr}
        setForm={props.setForm}
        setTouched={props.setTouched}
      />
      <AccrualPolicyLimitsDatesFields
        form={props.form}
        loading={props.loading}
        fromErr={props.fromErr}
        setForm={props.setForm}
        onBlurFrom={() => props.setTouched({ from: true })}
      />
    </>
  )
}