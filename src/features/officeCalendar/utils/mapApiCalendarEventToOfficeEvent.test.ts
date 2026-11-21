import { describe, expect, it } from 'vitest'

import { mapApiCalendarEventToOfficeEvent } from './mapApiCalendarEventToOfficeEvent'

describe('mapApiCalendarEventToOfficeEvent', () => {
  it('maps ISO datetimes and API enums', () => {
    const mapped = mapApiCalendarEventToOfficeEvent({
      id: 'ce-1',
      title: 'Standup',
      type: 'MEETING',
      startAt: '2026-03-10T09:30:00.000Z',
      endAt: '2026-03-10T10:00:00.000Z',
      visibility: 'PUBLIC',
      description: 'Daily sync',
    })

    expect(mapped).toMatchObject({
      id: 'ce-1',
      title: 'Standup',
      type: 'meeting',
      startDate: '2026-03-10',
      endDate: '2026-03-10',
      visibility: 'public',
      allDay: false,
    })
    expect(mapped.startTime).toBe('09:30')
  })
})