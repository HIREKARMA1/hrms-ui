import { HolidayListRowActions } from '@/components/shared/holidayList/HolidayListRowActions'
import { HolidayMandatoryBadge } from '@/components/shared/holidayList/HolidayMandatoryBadge'
import {
  HOLIDAY_LIST_EMPTY_CELL,
  HOLIDAY_LIST_ROW,
  HOLIDAY_LIST_TABLE,
  HOLIDAY_LIST_TABLE_THEAD,
  HOLIDAY_LIST_TABLE_WRAPPER,
  HOLIDAY_LIST_TD_MUTED,
  HOLIDAY_LIST_TD_NAME,
  HOLIDAY_LIST_TH,
} from '@/components/shared/holidayList/holidayListTableUi'

import type { OfficeHoliday } from '../../types/officeCalendar'
import { formatOfficeDate } from '../../utils/formatOfficeCalendarDate'

type OfficeCalendarHolidayTableProps = {
  holidays: OfficeHoliday[]
  readOnly: boolean
  /** Per-action permission (default allowed); combined with `readOnly`. */
  canEdit?: boolean
  canDelete?: boolean
  onEdit: (item: OfficeHoliday) => void
  onDelete: (id: string) => void
  emptyLabel?: string
}

export function OfficeCalendarHolidayTable({
  holidays,
  readOnly,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
  emptyLabel = 'No holidays match your filters.',
}: OfficeCalendarHolidayTableProps) {
  const showActions = !readOnly && (canEdit || canDelete)
  const colSpan = showActions ? 5 : 4

  return (
    <div className={HOLIDAY_LIST_TABLE_WRAPPER}>
      <table className={HOLIDAY_LIST_TABLE}>
        <thead className={HOLIDAY_LIST_TABLE_THEAD}>
          <tr>
            <th className={HOLIDAY_LIST_TH}>Holiday Name</th>
            <th className={HOLIDAY_LIST_TH}>Date</th>
            <th className={HOLIDAY_LIST_TH}>Type</th>
            <th className={HOLIDAY_LIST_TH}>Mandatory</th>
            {showActions ? <th className={HOLIDAY_LIST_TH}>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {holidays.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className={HOLIDAY_LIST_EMPTY_CELL}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            holidays.map((item) => (
              <tr key={item.id} className={HOLIDAY_LIST_ROW}>
                <td className={HOLIDAY_LIST_TD_NAME}>{item.name}</td>
                <td className={HOLIDAY_LIST_TD_MUTED}>{formatOfficeDate(item.date)}</td>
                <td className={HOLIDAY_LIST_TD_MUTED}>{item.type}</td>
                <td className={HOLIDAY_LIST_TD_MUTED}>
                  <HolidayMandatoryBadge mandatory={item.mandatory} />
                </td>
                {showActions ? (
                  <td className={HOLIDAY_LIST_TD_MUTED}>
                    <HolidayListRowActions
                      holidayName={item.name}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item.id)}
                      showEdit={canEdit}
                      showDelete={canDelete}
                    />
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}