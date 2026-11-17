import { Link } from 'react-router-dom'

import { isEmployeeExperience, type UserRole } from '@/features/leave/constants/userRoles'

import { CALENDAR_INFO_BANNER } from '../shared/officeCalendarUi'

type OfficeCalendarHolidaySourceNoteProps = {
  role: UserRole
}

export function OfficeCalendarHolidaySourceNote({ role }: OfficeCalendarHolidaySourceNoteProps) {
  return (
    <p className={CALENDAR_INFO_BANNER}>
      Holidays here are for the <strong className="font-medium">office calendar</strong> (events +
      schedule).{' '}
      {isEmployeeExperience(role) ? (
        <>
          For attendance policy lists, see{' '}
          <Link to="/employee/holidays" className="font-medium text-hrms-primary underline">
            Company Holidays
          </Link>
          .
        </>
      ) : (
        <>Attendance holiday settings are separate until sync is defined.</>
      )}
    </p>
  )
}