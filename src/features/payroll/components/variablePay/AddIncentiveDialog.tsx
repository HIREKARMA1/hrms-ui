/**

 * Dialog to add a positive incentive amount for the selected payroll month.

 * Uses shared PayrollDialog shell; used from IncentivesTab.

 */



import { useState } from 'react'



import { Input } from '@/components/ui/input'



import { INCENTIVE_TYPES } from '../../constants/variablePayLabels'

import { usePayrollActiveEmployees } from '../../hooks/usePayrollActiveEmployees'

import { usePayroll } from '../../hooks/usePayroll'

import type { IncentiveEntry } from '../../types/variablePay'

import { formatMonth } from '../../utils/formatMonth'

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



type AddIncentiveDialogProps = {

  open: boolean

  onOpenChange: (open: boolean) => void

  onSaved: () => void

}



export function AddIncentiveDialog({ open, onOpenChange, onSaved }: AddIncentiveDialogProps) {

  const { payrollMonth, upsertIncentive } = usePayroll()

  const activeEmployees = usePayrollActiveEmployees()

  const [employeeId, setEmployeeId] = useState(activeEmployees[0]?.id ?? '')

  const [incentiveType, setIncentiveType] = useState<IncentiveEntry['incentiveType']>(INCENTIVE_TYPES[0])

  const [amount, setAmount] = useState('')

  const [note, setNote] = useState('')

  const [error, setError] = useState<string | null>(null)



  async function handleSubmit() {

    const parsed = Number(amount)

    if (!employeeId || parsed <= 0) {

      setError('Enter a positive amount.')

      return

    }

    await upsertIncentive({

      id: `INC-${employeeId}-${payrollMonth}-${parsed}`,

      employeeId,

      payrollMonth,

      incentiveType,

      amount: parsed,

      note: note || undefined,

      status: 'Pending approval',

    })

    onSaved()

    onOpenChange(false)

    setAmount('')

    setNote('')

    setError(null)

  }



  return (

    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>

      <PayrollDialogPortal>

        <PayrollDialogOverlay />

        <PayrollDialogContent size="sm">

          <PayrollDialogHeader

            title="Add incentive"

            description={`Payroll month: ${formatMonth(payrollMonth)}`}

          />

          <PayrollDialogBody>

            <PayrollDialogField label="Employee" htmlFor="inc-employee">

              <select

                id="inc-employee"

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

            <PayrollDialogField label="Type" htmlFor="inc-type">

              <select

                id="inc-type"

                className={PAYROLL_DIALOG_SELECT}

                value={incentiveType}

                onChange={(e) => setIncentiveType(e.target.value as IncentiveEntry['incentiveType'])}

              >

                {INCENTIVE_TYPES.map((item) => (

                  <option key={item} value={item}>

                    {item}

                  </option>

                ))}

              </select>

            </PayrollDialogField>

            <PayrollDialogField label="Amount" htmlFor="inc-amount">

              <div className="relative">

                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-hrms-text-muted">

                  ₹

                </span>

                <Input

                  id="inc-amount"

                  type="number"

                  min={0}

                  value={amount}

                  onChange={(e) => setAmount(e.target.value)}

                  className="pl-8"

                />

              </div>

            </PayrollDialogField>

            <PayrollDialogField label="Note" htmlFor="inc-note">

              <Input id="inc-note" value={note} onChange={(e) => setNote(e.target.value)} />

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

