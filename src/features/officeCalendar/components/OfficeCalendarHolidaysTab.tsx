import type { UserRole } from '@/features/leave/constants/userRoles'

import { useOfficeCalendarHolidayTab } from '../hooks/useOfficeCalendarHolidayTab'
import type { OfficeHoliday, OfficeHolidayInput } from '../types/officeCalendar'
import { OfficeCalendarHolidaySourceNote } from './holidays/OfficeCalendarHolidaySourceNote'
import { OfficeCalendarHolidayTable } from './holidays/OfficeCalendarHolidayTable'
import { OfficeCalendarHolidayToolbar } from './holidays/OfficeCalendarHolidayToolbar'
import { OfficeHolidayFormDialog } from './holidays/OfficeHolidayFormDialog'

type OfficeCalendarHolidaysTabProps = {
  role: UserRole
  holidays: OfficeHoliday[]
  readOnly: boolean
  onSave: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  onDelete: (id: string) => Promise<void>
}

export function OfficeCalendarHolidaysTab({
  role,
  holidays,
  readOnly,
  onSave,
  onDelete,
}: OfficeCalendarHolidaysTabProps) {
  const tab = useOfficeCalendarHolidayTab(holidays, onDelete)

  return (
    <div className="flex flex-col gap-4">
      <OfficeCalendarHolidaySourceNote role={role} />
      <OfficeCalendarHolidayToolbar
        filters={tab.filters}
        onFiltersChange={tab.setFilters}
        onAdd={tab.openCreate}
        canManage={!readOnly}
      />
      <OfficeCalendarHolidayTable
        holidays={tab.filtered}
        readOnly={readOnly}
        onEdit={tab.openEdit}
        onDelete={(id) => void tab.handleDelete(id)}
      />
      {!readOnly ? (
        <OfficeHolidayFormDialog
          open={tab.formOpen}
          onOpenChange={tab.setFormOpen}
          mode={tab.formMode}
          initial={tab.editHoliday}
          onSave={onSave}
        />
      ) : null}
    </div>
  )
}