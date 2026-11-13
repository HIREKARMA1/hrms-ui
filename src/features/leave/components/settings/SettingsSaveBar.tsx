/**
 * Sticky save actions for Leave Settings tab inside the content area.
 */

import { Button } from '@/components/ui/button'

type SettingsSaveBarProps = {
  isDirty: boolean
  errors: string[]
  onSave: () => void
  onDiscard: () => void
}

export function SettingsSaveBar({ isDirty, errors, onSave, onDiscard }: SettingsSaveBarProps) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 border-t border-hrms-border bg-white py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      {errors.length > 0 ? (
        <ul className="mb-2 space-y-1 px-3 text-sm text-hrms-danger sm:px-4" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4">
        {isDirty ? (
          <p className="text-sm font-medium text-hrms-warning">Unsaved changes</p>
        ) : (
          <p className="text-sm text-hrms-text-muted">All changes saved</p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDiscard} disabled={!isDirty}>
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
