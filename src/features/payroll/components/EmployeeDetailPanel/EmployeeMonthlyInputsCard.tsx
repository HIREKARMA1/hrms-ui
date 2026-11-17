/**
 * Editable TDS, LOP days, and loan recovery for the active payroll month.
 */

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { usePayroll } from '../../hooks/usePayroll'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import type { EmployeeWithComputed } from '../../types/payroll'

type EmployeeMonthlyInputsCardProps = {
  employee: EmployeeWithComputed
}

export function EmployeeMonthlyInputsCard({ employee }: EmployeeMonthlyInputsCardProps) {
  const { updateEmployeeMonthlyInputs } = usePayroll()
  const { showToast } = usePayrollToast()
  const [incomeTax, setIncomeTax] = useState(String(employee.incomeTax))
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState(String(employee.unpaidLeaveDays))
  const [loanRecovery, setLoanRecovery] = useState(String(employee.loanRecovery))

  useEffect(() => {
    setIncomeTax(String(employee.incomeTax))
    setUnpaidLeaveDays(String(employee.unpaidLeaveDays))
    setLoanRecovery(String(employee.loanRecovery))
  }, [employee.id, employee.incomeTax, employee.unpaidLeaveDays, employee.loanRecovery])

  async function handleSave() {
    const tax = Number(incomeTax)
    const lop = Number(unpaidLeaveDays)
    const loan = Number(loanRecovery)
    if ([tax, lop, loan].some((value) => Number.isNaN(value) || value < 0)) {
      showToast('Enter valid non-negative amounts.')
      return
    }
    if (!Number.isInteger(lop)) {
      showToast('Unpaid leave days must be a whole number.')
      return
    }
    await updateEmployeeMonthlyInputs(employee.id, {
      incomeTax: tax,
      unpaidLeaveDays: lop,
      loanRecovery: loan,
    })
    showToast('Monthly payroll inputs updated.')
  }

  return (
    <div className="space-y-3 rounded-xl border border-hrms-border bg-white p-4">
      <p className="font-semibold text-hrms-navy">Monthly payroll inputs</p>
      <p className="text-xs text-hrms-text-muted">
        TDS is manual per employee; loss-of-pay days apply the company LOP rule from Settings.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`tds-${employee.id}`}>Income tax (TDS)</Label>
          <Input
            id={`tds-${employee.id}`}
            type="number"
            min={0}
            value={incomeTax}
            onChange={(event) => setIncomeTax(event.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`lop-${employee.id}`}>Unpaid leave days</Label>
          <Input
            id={`lop-${employee.id}`}
            type="number"
            min={0}
            step={1}
            value={unpaidLeaveDays}
            onChange={(event) => setUnpaidLeaveDays(event.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`loan-${employee.id}`}>Loan recovery</Label>
          <Input
            id={`loan-${employee.id}`}
            type="number"
            min={0}
            value={loanRecovery}
            onChange={(event) => setLoanRecovery(event.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <Button type="button" size="sm" onClick={() => void handleSave()}>
        Save inputs
      </Button>
    </div>
  )
}