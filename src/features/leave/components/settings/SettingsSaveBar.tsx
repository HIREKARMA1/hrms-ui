/**
 * Sticky save bar with unsaved count for Leave Settings tab.
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { SettingsValidationIssue } from '../../utils/validateLeaveSettings'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'

type SettingsSaveBarProps = {
  dirtyCount: number
  issues: SettingsValidationIssue[]
  onSave: () => void
  onDiscard: () => void
  saving?: boolean
}

export function SettingsSaveBar({ dirtyCount, issues, onSave, onDiscard, saving }: SettingsSaveBarProps) {
  const isDirty = dirtyCount > 0
  return (
    <div className="sticky bottom-0 z-10 mt-6 border-t border-hrms-border bg-white py-3 shadow-[0_-4px_12px_rgba(23,33,58,0.06)]">
      {issues.length > 0 ? (
        <ul className="mb-2 space-y-1 px-3 text-sm text-hrms-danger sm:px-4" role="alert">
          {issues.map((item) => (
            <li key={`${item.section}-${item.message}`}>{item.message}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4">
        {isDirty ? (
          <p className="text-sm font-medium text-hrms-warning">{dirtyCount} unsaved change{dirtyCount === 1 ? '' : 's'}</p>
        ) : (
          <p className="text-sm text-hrms-text-secondary">All changes saved</p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={onDiscard} disabled={!isDirty || saving}>
            Discard
          </Button>
          <Button type="button" onClick={onSave} disabled={!isDirty || saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
