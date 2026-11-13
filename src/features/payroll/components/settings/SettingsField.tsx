/**

 * Labelled settings input row for numeric and text fields.

 * Used across Payroll Settings cards; optional unit prefix or suffix.

 */



import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'



type SettingsFieldProps = {

  id: string

  label: string

  value: string | number

  type?: 'text' | 'number'

  onChange: (value: string) => void

  hint?: string

  unit?: string

  unitPlacement?: 'prefix' | 'suffix'

}



export function SettingsField({

  id,

  label,

  value,

  type = 'number',

  onChange,

  hint,

  unit,

  unitPlacement = 'suffix',

}: SettingsFieldProps) {

  const inputPad =

    unit === undefined

      ? 'mt-1'

      : unitPlacement === 'prefix'

        ? 'mt-1 pl-10'

        : 'mt-1 pr-12'



  return (

    <div>

      <Label htmlFor={id} className="text-sm font-medium text-hrms-navy">
        {label}
      </Label>

      <div className="relative">

        <Input

          id={id}

          type={type}

          value={value}

          onChange={(event) => onChange(event.target.value)}

          className={inputPad}

        />

        {unit ? (

          <span

            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-hrms-text-muted ${

              unitPlacement === 'prefix' ? 'left-3' : 'right-3'

            }`}

          >

            {unit}

          </span>

        ) : null}

      </div>

      {hint ? <p className="mt-1 text-xs text-hrms-text-secondary">{hint}</p> : null}

    </div>

  )

}


