import { Link } from 'react-router-dom'

import { isEmployeeExperience, type UserRole } from '@/features/leave/constants/userRoles'

import type { OfficeHolidayListSource } from '../../context/officeCalendarContext'
import { CALENDAR_INFO_BANNER } from '../shared/officeCalendarUi'

type OfficeCalendarHolidaySourceNoteProps = {
  role: UserRole
  holidaysSource?: OfficeHolidayListSource
}

export function OfficeCalendarHolidaySourceNote({
  role,
  holidaysSource = 'demo',
}: OfficeCalendarHolidaySourceNoteProps) {
  return (
    <p className={CALENDAR_INFO_BANNER}>
      {holidaysSource === 'api' ? (
        <>
          Holiday list is loaded from <strong className="font-medium">GET /holidays</strong> for the
          selected year. Create, update, and delete use{' '}
          <strong className="font-medium">POST /holidays</strong>,{' '}
          <strong className="font-medium">PATCH /holidays/{'{'}id{'}'}</strong>, and{' '}
          <strong className="font-medium">DELETE /holidays/{'{'}id{'}'}</strong>.
        </>
      ) : (
        <>
          Holidays use the local office-calendar demo until you sign in with{' '}
          <strong className="font-medium">holidays:read</strong>.
        </>
      )}{' '}
      This tab is for the <strong className="font-medium">office calendar</strong> (events and
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