/**

 * Sticky save actions and unsaved indicator for Payroll Settings.

 * Used at the bottom of PayrollSettingsTab within the tab content area.

 */



import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'



import { PAYROLL_SECONDARY_BUTTON } from '../shared/payrollUi'



type SettingsSaveBarProps = {

  isDirty: boolean

  errors: string[]

  onSave: () => void

  onDiscard: () => void

}



export function SettingsSaveBar({

  isDirty,

  errors,

  onSave,

  onDiscard,

}: SettingsSaveBarProps) {

  return (

    <div className="sticky bottom-0 z-10 mt-6 border-t border-hrms-border bg-white py-3 shadow-[0_-6px_16px_rgba(23,33,58,0.06)]">

      {errors.length > 0 ? (

        <ul className="mb-2 space-y-1 px-3 text-sm text-hrms-danger sm:px-4" role="alert">

          {errors.map((error) => (

            <li key={error}>{error}</li>

          ))}

        </ul>

      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4">

        {isDirty ? (

          <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-hrms-warning">

            <span className="h-2 w-2 shrink-0 rounded-full bg-hrms-warning" aria-hidden />

            Unsaved changes

          </p>

        ) : (

          <p className="min-w-0 text-sm text-hrms-text-secondary">All changes saved</p>

        )}

        <div className="flex shrink-0 flex-wrap gap-2">

          <Button

            type="button"

            variant="outline"

            className={cn(PAYROLL_SECONDARY_BUTTON)}

            onClick={onDiscard}

            disabled={!isDirty}

          >

            Discard

          </Button>

          <Button type="button" onClick={onSave} disabled={!isDirty}>

            Save settings

          </Button>

        </div>

      </div>

    </div>

  )

}

