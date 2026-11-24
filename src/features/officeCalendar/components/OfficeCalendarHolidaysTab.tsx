import type { UserRole } from '@/features/leave/constants/userRoles'

import { useHolidayPermissions } from '@/features/rbac/hooks/useHolidayPermissions'



import { useHolidayCalendarDownloadImport } from '../hooks/useHolidayCalendarDownloadImport'

import { useHolidayNotifyAction } from '../hooks/useHolidayNotifyAction'

import { useOfficeCalendar } from '../hooks/useOfficeCalendar'

import { useOfficeCalendarHolidayTab } from '../hooks/useOfficeCalendarHolidayTab'

import type { OfficeHoliday, OfficeHolidayInput } from '../types/officeCalendar'

import { OfficeCalendarHolidaySourceNote } from './holidays/OfficeCalendarHolidaySourceNote'

import { OfficeCalendarHolidayImportReportDialog } from './holidays/OfficeCalendarHolidayImportReportDialog'

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

  const { holidayYear, setHolidayYear, holidaysSource, holidaysFetching } = useOfficeCalendar()

  const useLiveList = holidaysSource === 'api'

  const tab = useOfficeCalendarHolidayTab(holidays, onDelete)

  const calendarFile = useHolidayCalendarDownloadImport(holidayYear)

  const notify = useHolidayNotifyAction()

  const perms = useHolidayPermissions()

  const canCreate = !readOnly && perms.canCreate

  const canUpdate = !readOnly && perms.canUpdate

  const canDelete = !readOnly && perms.canDelete

  const canNotify = useLiveList && !readOnly && perms.canNotify && notify.canNotify



  return (

    <div className="flex flex-col gap-4">

      <OfficeCalendarHolidaySourceNote role={role} holidaysSource={holidaysSource} />

      <OfficeCalendarHolidayToolbar

        filters={tab.filters}

        onFiltersChange={tab.setFilters}

        onAdd={tab.openCreate}

        canManage={canCreate}

        holidayYear={holidayYear}

        onHolidayYearChange={setHolidayYear}

        useLiveList={useLiveList}

        listFetching={holidaysFetching}

        calendarActions={

          useLiveList

            ? {

                canDownload: calendarFile.canDownload,

                canImport: calendarFile.canImport,

                downloading: calendarFile.downloading,

                importing: calendarFile.importing,

                fileInputRef: calendarFile.fileInputRef,

                onDownloadPdf: () => void calendarFile.runDownload('pdf'),

                onDownloadExcel: () => void calendarFile.runDownload('xlsx'),

                onImportClick: calendarFile.openImportPicker,

                onImportFile: (file) => void calendarFile.onImportFile(file),

              }

            : undefined

        }

      />

      <OfficeCalendarHolidayTable

        holidays={tab.filtered}

        readOnly={readOnly}

        canEdit={canUpdate}

        canDelete={canDelete}

        canNotify={canNotify}

        onNotify={(item) => void notify.handleNotify(item.id, item.name, item.date, item.type)}

        isNotifyLoading={notify.isNotifyLoading}

        onEdit={tab.openEdit}

        onDelete={(id) => void tab.handleDelete(id)}

        emptyLabel={

          useLiveList

            ? `No holidays from the server for ${holidayYear} match your filters.`

            : undefined

        }

      />

      {canCreate || canUpdate ? (

        <OfficeHolidayFormDialog

          open={tab.formOpen}

          onOpenChange={tab.setFormOpen}

          mode={tab.formMode}

          initial={tab.editHoliday}

          onSave={onSave}

          useLiveApi={useLiveList}

        />

      ) : null}

      <OfficeCalendarHolidayImportReportDialog

        report={calendarFile.importReport}

        onClose={calendarFile.clearImportReport}

      />

    </div>

  )

}
