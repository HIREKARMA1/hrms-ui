/**
 * Labelled field row for payroll modal forms (consistent label and spacing).
 * Used inside AddIncentiveDialog, AddOvertimeDialog, and PrepareBonusRunDialog.
 */

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { PAYROLL_DIALOG_FIELD_LABEL } from './payrollUi'

type PayrollDialogFieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function PayrollDialogField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: PayrollDialogFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className={PAYROLL_DIALOG_FIELD_LABEL}>
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-hrms-text-secondary">{hint}</p> : null}
    </div>
  )
}
