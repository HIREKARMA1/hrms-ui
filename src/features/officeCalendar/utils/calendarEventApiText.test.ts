import { describe, expect, it } from 'vitest'

import type { ApiCalendarEventItem } from '../types/api/calendarEventsList.types'

import { resolveCalendarEventOrganizerName } from './calendarEventApiText'
import { mapApiCalendarEventToOfficeEvent } from './mapApiCalendarEventToOfficeEvent'

describe('resolveCalendarEventOrganizerName', () => {
  it('uses string fields in priority order', () => {
    const item: ApiCalendarEventItem = {
      id: '1',
      organizerName: 'HR Admin',
      organizerEmployeeName: '  Priya  ',
    }
    expect(resolveCalendarEventOrganizerName(item)).toBe('HR Admin')
    expect(
      resolveCalendarEventOrganizerName({
        id: '2',
        organizerEmployeeName: '  Priya  ',
      }),
    ).toBe('Priya')
  })

  it('reads name from organizer object', () => {
    const item: ApiCalendarEventItem = {
      id: '1',
      organizer: { fullName: 'Rahul Mehta' },
    }
    expect(resolveCalendarEventOrganizerName(item)).toBe('Rahul Mehta')
  })

  it('falls back when values are empty or invalid', () => {
    const item: ApiCalendarEventItem = {
      id: '1',
      organizer: null as unknown as Record<string, unknown>,
      createdByName: '   ',
    }
    expect(resolveCalendarEventOrganizerName(item)).toBe('Organizer')
  })
})

describe('mapApiCalendarEventToOfficeEvent organizer', () => {
  it('does not throw when organizer is an object', () => {
    const mapped = mapApiCalendarEventToOfficeEvent({
      id: 'ce-2',
      title: 'Town hall',
      startAt: '2026-03-10T09:00:00.000Z',
      endAt: '2026-03-10T10:00:00.000Z',
      organizer: { name: 'HR Admin' },
    })
    expect(mapped.organizerName).toBe('HR Admin')
  })
})