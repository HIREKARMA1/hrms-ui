/**
 * Currency input with rupee prefix for payroll settings amounts.
 * Used on Payroll Settings cards for monetary values.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SettingsAmountFieldProps = {
  id: string
  label: string
  value: number | string
  placeholder?: string
  onChange: (value: string) => void
}

export function SettingsAmountField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: SettingsAmountFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-hrms-text-muted">
          ₹
        </span>
        <Input
          id={id}
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  )
}
