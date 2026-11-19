import type { UserRole } from '@/features/leave/constants/userRoles'
import { useHolidayPermissions } from '@/features/rbac/hooks/useHolidayPermissions'

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
  // Role-based read-only still applies; each action also needs its own
  // backend permission (holidays:create / update / delete).
  const perms = useHolidayPermissions()
  const canCreate = !readOnly && perms.canCreate
  const canUpdate = !readOnly && perms.canUpdate

  return (
    <div className="flex flex-col gap-4">
      <OfficeCalendarHolidaySourceNote role={role} />
      <OfficeCalendarHolidayToolbar
        filters={tab.filters}
        onFiltersChange={tab.setFilters}
        onAdd={tab.openCreate}
        canManage={canCreate}
      />
      <OfficeCalendarHolidayTable
        holidays={tab.filtered}
        readOnly={readOnly}
        canEdit={perms.canUpdate}
        canDelete={perms.canDelete}
        onEdit={tab.openEdit}
        onDelete={(id) => void tab.handleDelete(id)}
      />
      {canCreate || canUpdate ? (
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