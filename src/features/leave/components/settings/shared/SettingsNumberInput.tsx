/**
 * Leave Settings number field with in-input unit and hidden spinners.
 */

import { LEAVE_SETTINGS_NUMBER_INPUT } from '../../shared/leaveUi'

type SettingsNumberInputProps = {
  id?: string
  value: number
  onChange: (value: number) => void
  unit: string
  min?: number
}

export function SettingsNumberInput({ id, value, onChange, unit, min }: SettingsNumberInputProps) {
  return (
    <div className="relative max-w-xs">
      <input
        id={id}
        type="number"
        min={min}
        inputMode="numeric"
        className={LEAVE_SETTINGS_NUMBER_INPUT}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-hrms-text-secondary">{unit}</span>
    </div>
  )
}
