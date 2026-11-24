import { describe, expect, it } from 'vitest'

import type { OfficeCalendarEventInput } from '../types/officeCalendar'
import { mapOfficeEventInputToCreateRequest } from './mapOfficeEventInputToCreateRequest'

const base: OfficeCalendarEventInput = {
  title: 'Town hall',
  type: 'meeting',
  startDate: '2026-04-15',
  endDate: '2026-04-15',
  startTime: '10:00',
  endTime: '11:00',
  allDay: false,
  visibility: 'private',
  departmentId: null,
  branchId: null,
  organizerName: 'HR Admin',
  description: 'All hands',
}

describe('mapOfficeEventInputToCreateRequest', () => {
  it('maps form fields to POST /calendar/events', () => {
    const body = mapOfficeEventInputToCreateRequest(base, { organizerEmployeeId: 'emp-1' })
    expect(body).toMatchObject({
      title: 'Town hall',
      eventType: 'MEETING',
      visibility: 'PRIVATE',
      isAllDay: false,
      description: 'All hands',
      organizerEmployeeId: 'emp-1',
    })
    expect(body.startAt).toContain('2026-04-15T10:00:00')
    expect(body.endAt).toContain('2026-04-15T11:00:00')
  })
})