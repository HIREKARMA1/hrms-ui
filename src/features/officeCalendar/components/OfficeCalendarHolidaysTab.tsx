import { useMemo } from 'react'

import { useGetHolidaysQuery } from '@/features/leave/api/holidaysApi'
import { mapApiHolidaysListToOfficeHolidays } from '@/features/leave/utils/mapApiHolidayToOfficeHoliday'
import { getApiErrorMessage } from '@/services/api/errors'
import type { UserRole } from '@/features/leave/constants/userRoles'

import { useOfficeCalendarHolidayTab } from '../hooks/useOfficeCalendarHolidayTab'
import { useShouldFetchHolidays } from '../hooks/useShouldFetchHolidays'
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
  const listYear = new Date().getFullYear()
  const shouldFetchHolidays = useShouldFetchHolidays()
  const {
    data: holidaysListData,
    isError: holidaysListIsError,
    error: holidaysListError,
    isFetching: holidaysListFetching,
  } = useGetHolidaysQuery({ year: listYear }, { skip: !shouldFetchHolidays })

  const holidaysFromApi = useMemo(() => {
    if (!shouldFetchHolidays || !holidaysListData || holidaysListIsError) {
      return null
    }
    return mapApiHolidaysListToOfficeHolidays(holidaysListData.items)
  }, [holidaysListData, holidaysListIsError, shouldFetchHolidays])

  const displayHolidays = holidaysFromApi ?? holidays
  const useLiveApi = holidaysFromApi !== null

  const tab = useOfficeCalendarHolidayTab(displayHolidays, onDelete)

  const listErrorMessage =
    shouldFetchHolidays && holidaysListIsError
      ? getApiErrorMessage(holidaysListError, 'Unable to load holidays from server. Showing demo list.')
      : null

  return (
    <div className="flex flex-col gap-4">
      <OfficeCalendarHolidaySourceNote role={role} />
      {listErrorMessage ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900" role="alert">
          {listErrorMessage}
        </p>
      ) : null}
      {holidaysListFetching && shouldFetchHolidays ? (
        <p className="text-xs text-hrms-text-muted">Loading holidays…</p>
      ) : null}
      <OfficeCalendarHolidayToolbar
        filters={tab.filters}
        onFiltersChange={tab.setFilters}
        onAdd={tab.openCreate}
        canManage={!readOnly && !useLiveApi}
      />
      <OfficeCalendarHolidayTable
        holidays={tab.filtered}
        readOnly={readOnly}
        hideDelete={useLiveApi}
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
          useLiveApi={useLiveApi && tab.formMode === 'edit'}
        />
      ) : null}
    </div>
  )
}