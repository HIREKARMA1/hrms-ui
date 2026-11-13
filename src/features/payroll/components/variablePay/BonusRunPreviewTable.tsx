/**
 * Editable bonus run preview grid with statutory eligibility and total row.
 * Rendered inside BonusRunPreviewStep inside PrepareBonusRunDialog.
 */

import { Input } from '@/components/ui/input'

import type { PayrollSettings } from '../../types/payrollSettings'
import type { SalaryStructure } from '../../types/salaryStructure'
import type { BonusRunLine, BonusRunType } from '../../types/variablePay'
import type { PayrollEmployee } from '../../types/payroll'
import { formatCurrency } from '../../utils/formatCurrency'
import { isStatutoryBonusEligible, wageFromBase } from '../../utils/variablePayCalculations'
import { recalcStatutoryBonusLine } from '../../utils/recalcStatutoryBonusLine'
import { resolveComponentAmounts, sumGross } from '../../utils/calculateGrossFromStructure'

type BonusRunPreviewTableProps = {
  bonusType: BonusRunType
  lines: BonusRunLine[]
  employees: PayrollEmployee[]
  settings: PayrollSettings
  structures: SalaryStructure[]
  onChange: (lines: BonusRunLine[]) => void
}

export function BonusRunPreviewTable({
  bonusType,
  lines,
  employees,
  settings,
  structures,
  onChange,
}: BonusRunPreviewTableProps) {
  const nameFor = (id: string) => employees.find((item) => item.id === id)?.name ?? id
  const isStatutory = bonusType === 'Statutory'
  const limit = settings.bonusRules.eligibilitySalaryLimit

  function patch(employeeId: string, patch: Partial<BonusRunLine>) {
    const structure = structures.find((item) => item.employeeId === employeeId)
    let next = lines.map((line) => (line.employeeId === employeeId ? { ...line, ...patch } : line))
    if (isStatutory && (patch.eligibleMonths !== undefined || patch.included !== undefined)) {
      const row = next.find((line) => line.employeeId === employeeId)!
      next = next.map((line) =>
        line.employeeId === employeeId ? recalcStatutoryBonusLine(row, structure, settings) : line,
      )
    }
    onChange(next)
  }

  const total = lines.filter((line) => line.included).reduce((sum, line) => sum + line.amount, 0)

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-hrms-text-secondary">
            <th className="py-2 pr-2">Include</th>
            <th className="py-2 pr-2">Employee</th>
            {isStatutory ? <th className="py-2 pr-2">Eligible months</th> : null}
            <th className="py-2 text-right font-semibold tabular-nums">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const structure = structures.find((item) => item.employeeId === line.employeeId)
            const row = isStatutory ? recalcStatutoryBonusLine(line, structure, settings) : line
            const monthly =
              structure && isStatutory
                ? wageFromBase(
                    settings.bonusRules.bonusWageBase,
                    resolveComponentAmounts(settings, structure.componentValues),
                    sumGross(resolveComponentAmounts(settings, structure.componentValues)),
                  )
                : 0
            const notEligible = isStatutory && !isStatutoryBonusEligible(settings, monthly)
            return (
              <tr key={line.employeeId} className="border-t border-hrms-border/60">
                <td className="py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={row.included}
                    disabled={notEligible}
                    onChange={(e) => patch(line.employeeId, { included: e.target.checked })}
                  />
                </td>
                <td className="py-2 pr-2">{nameFor(line.employeeId)}</td>
                {isStatutory ? (
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      className="max-w-[5rem]"
                      value={row.eligibleMonths ?? 12}
                      onChange={(e) =>
                        patch(line.employeeId, { eligibleMonths: Number(e.target.value) })
                      }
                    />
                  </td>
                ) : null}
                <td className="py-2 text-right">
                  {notEligible ? (
                    <span className="text-hrms-text-muted">Not eligible</span>
                  ) : (
                    <Input
                      type="number"
                      className="ml-auto max-w-[8rem] text-right tabular-nums"
                      value={row.amount}
                      onChange={(e) => patch(line.employeeId, { amount: Number(e.target.value) })}
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-hrms-border font-semibold text-hrms-navy">
            <td colSpan={isStatutory ? 3 : 2} className="py-2 pr-2 text-right">
              Total
            </td>
            <td className="py-2 text-right tabular-nums">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
      {isStatutory ? (
        <p className="mt-2 text-xs text-hrms-text-muted">
          Statutory bonus applies when monthly salary is at or below {formatCurrency(limit)}.
        </p>
      ) : null}
    </>
  )
}
