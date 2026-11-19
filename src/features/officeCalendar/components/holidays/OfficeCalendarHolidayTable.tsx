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
  onEdit: (item: OfficeHoliday) => void
  onDelete: (id: string) => void
  emptyLabel?: string
  /** Hide delete when rows come from the live API (mutations not wired). */
  hideDelete?: boolean
}

export function OfficeCalendarHolidayTable({
  holidays,
  readOnly,
  onEdit,
  onDelete,
  emptyLabel = 'No holidays match your filters.',
  hideDelete = false,
}: OfficeCalendarHolidayTableProps) {
  const colSpan = readOnly ? 4 : 5

  return (
    <div className={HOLIDAY_LIST_TABLE_WRAPPER}>
      <table className={HOLIDAY_LIST_TABLE}>
        <thead className={HOLIDAY_LIST_TABLE_THEAD}>
          <tr>
            <th className={HOLIDAY_LIST_TH}>Holiday Name</th>
            <th className={HOLIDAY_LIST_TH}>Date</th>
            <th className={HOLIDAY_LIST_TH}>Type</th>
            <th className={HOLIDAY_LIST_TH}>Mandatory</th>
            {!readOnly ? <th className={HOLIDAY_LIST_TH}>Actions</th> : null}
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
                {!readOnly ? (
                  <td className={HOLIDAY_LIST_TD_MUTED}>
                    <HolidayListRowActions
                      holidayName={item.name}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item.id)}
                      showDelete={!hideDelete}
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