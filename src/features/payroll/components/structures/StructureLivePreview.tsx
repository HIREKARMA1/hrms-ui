/**
 * Live payroll preview while editing a salary structure.
 * Used in StructureEditorTab inside StructureDetailPanel.
 */

import type { ComputedPayroll } from '../../types/payroll'
import { formatCurrency } from '../../utils/formatCurrency'
import { BasicWagesWarningBanner } from './BasicWagesWarningBanner'

type StructureLivePreviewProps = {
  preview: ComputedPayroll
}

export function StructureLivePreview({ preview }: StructureLivePreviewProps) {
  const rows = [
    { label: 'Gross (monthly)', value: preview.gross },
    { label: 'PF (employee)', value: preview.employeePf },
    { label: 'PF (employer)', value: preview.employerPf },
    { label: 'ESI (employee)', value: preview.employeeEsi },
    { label: 'ESI (employer)', value: preview.employerEsi },
    { label: 'Professional tax', value: preview.professionalTax },
    { label: 'Net pay (estimate)', value: preview.netPay },
    { label: 'Annual CTC (estimate)', value: preview.annualCtc },
  ]

  return (
    <div className="space-y-3">
      <BasicWagesWarningBanner
        basicAmount={preview.componentAmounts.basic}
        grossAmount={preview.gross}
      />
      <div className="rounded-xl border border-hrms-border bg-hrms-page p-4 text-sm">
        <p className="mb-2 font-semibold text-hrms-navy">Live preview</p>
        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.label} className="flex justify-between gap-3 py-1">
              <span className="text-hrms-text-secondary">{row.label}</span>
              <span className="tabular-nums text-hrms-navy">{formatCurrency(row.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
