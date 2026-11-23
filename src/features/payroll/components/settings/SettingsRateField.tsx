/**

 * Numeric input with unit suffix for rates and multipliers on settings cards.

 * Defaults to %; pass unit="x" for overtime multipliers.

 */



import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'



type SettingsRateFieldProps = {

  id: string

  label: string

  value: number | string

  unit?: string

  onChange: (value: string) => void

}



export function SettingsRateField({

  id,

  label,

  value,

  unit = '%',

  onChange,

}: SettingsRateFieldProps) {

  return (

    <div>

      <Label htmlFor={id}>{label}</Label>

      <div className="relative mt-1">

        <Input

          id={id}

          type="number"

          value={value}

          onChange={(event) => onChange(event.target.value)}

          className="pr-12"

        />

        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-hrms-text-muted">

          {unit}

        </span>

      </div>

    </div>

  )

}


