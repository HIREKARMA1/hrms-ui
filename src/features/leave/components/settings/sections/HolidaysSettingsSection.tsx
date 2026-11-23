/**
 * Holiday list with year filter, add/edit dialog, and remove confirmation.
 */

import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Holiday } from '../../../types/holiday'
import type { LeaveSettings } from '../../../types/leaveSettings'
import { isWeeklyOffDay, weekdayNameFromIso } from '../../../utils/weekday'
import { formatDate } from '../../../utils/formatDate'
import { LeaveConfirmDialog } from '../../shared/LeaveConfirmDialog'
import { LEAVE_SECONDARY_BUTTON, LEAVE_TABLE_THEAD } from '../../shared/leaveUi'
import { HolidayEditDialog } from '../holidays/HolidayEditDialog'
import { useHolidayPermissions } from '@/features/rbac/hooks/useHolidayPermissions'

type HolidaysSettingsSectionProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
  showSampleBanner: boolean
}

export function HolidaysSettingsSection({ draft, onChange, showSampleBanner }: HolidaysSettingsSectionProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [editor, setEditor] = useState<Holiday | 'new' | null>(null)
  const [removing, setRemoving] = useState<Holiday | null>(null)
  const { canCreate, canUpdate, canDelete } = useHolidayPermissions()

  const holidays = useMemo(
    () =>
      draft.holidays
        .filter((item) => item.date.startsWith(String(year)))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [draft.holidays, year],
  )
  const takenDates = useMemo(() => new Set(draft.holidays.map((item) => item.date)), [draft.holidays])

  function upsert(holiday: Holiday) {
    const exists = draft.holidays.some((item) => item.id === holiday.id)
    const next = exists ? draft.holidays.map((item) => (item.id === holiday.id ? holiday : item)) : [...draft.holidays, holiday]
    onChange({ ...draft, holidays: next })
  }

  function remove(id: string) {
    onChange({ ...draft, holidays: draft.holidays.filter((item) => item.id !== id) })
    setRemoving(null)
  }

  return (
    <div className="space-y-4">
      {showSampleBanner ? <p className="text-sm text-hrms-text-secondary">Sample holidays, edit for your company.</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-hrms-navy" htmlFor="holiday-year">
          Year
        </label>
        <select id="holiday-year" className="h-10 rounded-xl border border-hrms-border bg-white px-3 text-sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[year - 1, year, year + 1].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        {canCreate ? (
          <Button type="button" className="ml-auto gap-1" onClick={() => setEditor('new')}>
            <Plus className="h-4 w-4" aria-hidden />
            Add holiday
          </Button>
        ) : null}
      </div>
      {holidays.length === 0 ? (
        <HolidaysEmptyState canAdd={canCreate} onAdd={() => setEditor('new')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className={LEAVE_TABLE_THEAD}>
              <tr>
                {['Date', 'Day', 'Name', 'Type', ''].map((head) => (
                  <th key={head} className="px-2 py-2 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id} className="border-t border-hrms-border/60">
                  <td className="px-2 py-2">{formatDate(holiday.date)}</td>
                  <td className="px-2 py-2 text-hrms-text-secondary">
                    {weekdayNameFromIso(holiday.date)}
                    {isWeeklyOffDay(holiday.date, draft.weeklyOffDays) ? (
                      <span className="ml-1 rounded-md bg-hrms-lavender px-1.5 py-0.5 text-[10px] font-medium text-hrms-primary">Weekly off</span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 font-medium text-hrms-navy">{holiday.name}</td>
                  <td className="px-2 py-2">
                    <span className="rounded-full bg-hrms-muted-bg px-2 py-0.5 text-xs">{holiday.holidayType}</span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      {canUpdate ? (
                        <button type="button" className="rounded-lg p-2 text-hrms-primary hover:bg-hrms-row-hover" aria-label="Edit holiday" onClick={() => setEditor(holiday)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button type="button" className="rounded-lg p-2 text-hrms-danger hover:bg-hrms-row-hover" aria-label="Remove holiday" onClick={() => setRemoving(holiday)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <HolidayEditDialog
        open={editor != null && (editor === 'new' ? canCreate : canUpdate)}
        initial={editor === 'new' ? null : editor}
        takenDates={takenDates}
        onOpenChange={(open) => !open && setEditor(null)}
        onSave={upsert}
      />
      <LeaveConfirmDialog
        open={removing != null && canDelete}
        title="Remove holiday?"
        description={removing ? `${removing.name} on ${formatDate(removing.date)} will be removed.` : ''}
        confirmLabel="Remove"
        danger
        onConfirm={() => removing && remove(removing.id)}
        onOpenChange={(open) => !open && setRemoving(null)}
      />
    </div>
  )
}

function HolidaysEmptyState({ canAdd, onAdd }: { canAdd: boolean; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-hrms-border px-4 py-8 text-center">
      <p className="text-sm text-hrms-text-secondary">No holidays for this year yet.</p>
      {canAdd ? (
        <Button type="button" variant="outline" className={`mt-3 ${LEAVE_SECONDARY_BUTTON}`} onClick={onAdd}>
          Add holiday
        </Button>
      ) : null}
    </div>
  )
}
