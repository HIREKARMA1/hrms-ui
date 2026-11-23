/**

 * Dialog to add manual overtime hours with live amount from settings.

 * Uses shared PayrollDialog shell; used from OvertimeTab.

 */



import { useMemo, useState } from 'react'



import { Input } from '@/components/ui/input'



import { usePayrollActiveEmployees } from '../../hooks/usePayrollActiveEmployees'

import { usePayroll } from '../../hooks/usePayroll'

import type { OvertimeEntry } from '../../types/variablePay'

import { resolveComponentAmounts, sumGross } from '../../utils/calculateGrossFromStructure'

import { formatMonth } from '../../utils/formatMonth'

import { formatCurrency } from '../../utils/formatCurrency'

import {

  calculateOvertimePay,

  hourlyOvertimeRate,

  wageFromBase,

} from '../../utils/variablePayCalculations'

import {

  PayrollDialogBody,

  PayrollDialogCloseButton,

  PayrollDialogContent,

  PayrollDialogFooter,

  PayrollDialogFooterActions,

  PayrollDialogHeader,

  PayrollDialogOverlay,

  PayrollDialogPortal,

  PayrollDialogRoot,

} from '../shared/PayrollDialog'

import { PayrollDialogField } from '../shared/PayrollDialogField'

import { PAYROLL_DIALOG_SELECT } from '../shared/payrollUi'



type AddOvertimeDialogProps = {

  open: boolean

  onOpenChange: (open: boolean) => void

  onSave: (entry: OvertimeEntry) => void

}



export function AddOvertimeDialog({ open, onOpenChange, onSave }: AddOvertimeDialogProps) {

  const { settings, structures, payrollMonth, upsertOvertime } = usePayroll()

  const activeEmployees = usePayrollActiveEmployees()

  const [employeeId, setEmployeeId] = useState(activeEmployees[0]?.id ?? '')

  const [hours, setHours] = useState('')

  const [note, setNote] = useState('')

  const [error, setError] = useState<string | null>(null)



  const structure = structures.find((item) => item.employeeId === employeeId)

  const monthlyBase = useMemo(() => {

    if (!structure) {

      return 0

    }

    const components = resolveComponentAmounts(settings, structure.componentValues)

    return wageFromBase(settings.overtimeRules.rateBase, components, sumGross(components))

  }, [settings, structure])



  const rate = structure ? hourlyOvertimeRate(settings, monthlyBase) : 0

  const estimated = hours ? calculateOvertimePay(Number(hours), rate) : 0



  async function handleSubmit() {

    const parsedHours = Number(hours)

    if (!employeeId || parsedHours <= 0) {

      setError('Enter a valid employee and positive hours.')

      return

    }

    const cap = settings.overtimeRules.maxHoursPerMonth

    if (cap !== null && parsedHours > cap) {

      setError(`Hours exceed the monthly cap of ${cap}.`)

      return

    }

    const entry: OvertimeEntry = {

      id: `OT-${employeeId}-${payrollMonth}-${parsedHours}`,

      employeeId,

      payrollMonth,

      hours: parsedHours,

      ratePerHour: rate,

      amount: estimated,

      source: 'Manual',

      note: note || undefined,

      status: 'Pending approval',

    }

    await upsertOvertime(entry)

    onSave(entry)

    onOpenChange(false)

    setHours('')

    setNote('')

    setError(null)

  }



  return (

    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>

      <PayrollDialogPortal>

        <PayrollDialogOverlay />

        <PayrollDialogContent size="sm">

          <PayrollDialogHeader

            title="Add overtime"

            description={`Payroll month: ${formatMonth(payrollMonth)}`}

          />

          <PayrollDialogBody>

            <PayrollDialogField label="Employee" htmlFor="ot-employee">

              <select

                id="ot-employee"

                className={PAYROLL_DIALOG_SELECT}

                value={employeeId}

                onChange={(e) => setEmployeeId(e.target.value)}

              >

                {activeEmployees.map((employee) => (

                  <option key={employee.id} value={employee.id}>

                    {employee.name}

                  </option>

                ))}

              </select>

            </PayrollDialogField>

            <PayrollDialogField label="Hours" htmlFor="ot-hours">

              <Input

                id="ot-hours"

                type="number"

                min={0}

                step="0.5"

                value={hours}

                onChange={(e) => setHours(e.target.value)}

              />

            </PayrollDialogField>

            <div className="grid gap-3 rounded-xl bg-hrms-page p-3 sm:grid-cols-2">

              <SummaryStat label="Hourly rate" value={formatCurrency(rate)} />

              <SummaryStat label="Estimated amount" value={hours ? formatCurrency(estimated) : '—'} />

            </div>

            <PayrollDialogField label="Note" htmlFor="ot-note">

              <Input id="ot-note" value={note} onChange={(e) => setNote(e.target.value)} />

            </PayrollDialogField>

            {error ? (

              <p className="text-sm text-hrms-danger" role="alert">

                {error}

              </p>

            ) : null}

          </PayrollDialogBody>

          <PayrollDialogFooter>

            <PayrollDialogFooterActions primaryLabel="Save" onPrimary={() => void handleSubmit()} />

          </PayrollDialogFooter>

          <PayrollDialogCloseButton />

        </PayrollDialogContent>

      </PayrollDialogPortal>

    </PayrollDialogRoot>

  )

}



function SummaryStat({ label, value }: { label: string; value: string }) {

  return (

    <div>

      <p className="text-xs font-medium text-hrms-text-secondary">{label}</p>

      <p className="mt-0.5 font-semibold tabular-nums text-hrms-navy">{value}</p>

    </div>

  )

}

