import { mockOfficeEvents, mockOfficeHolidays } from '../mocks/mockOfficeCalendarSeed'
import type {
  OfficeCalendarEvent,
  OfficeCalendarEventInput,
  OfficeHoliday,
  OfficeHolidayInput,
} from '../types/officeCalendar'

export let officeEventsStore: OfficeCalendarEvent[] = structuredClone(mockOfficeEvents)
export let officeHolidaysStore: OfficeHoliday[] = structuredClone(mockOfficeHolidays)

export function resetOfficeCalendarMockStore() {
  officeEventsStore = structuredClone(mockOfficeEvents)
  officeHolidaysStore = structuredClone(mockOfficeHolidays)
}

export async function fetchOfficeEvents(): Promise<OfficeCalendarEvent[]> {
  await delay()
  return structuredClone(officeEventsStore)
}

export async function fetchOfficeHolidays(): Promise<OfficeHoliday[]> {
  await delay()
  return structuredClone(officeHolidaysStore)
}

export async function upsertOfficeHoliday(
  input: OfficeHolidayInput,
  id?: string,
): Promise<OfficeHoliday> {
  await delay()
  if (id) {
    const index = officeHolidaysStore.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Holiday not found')
    const next = { ...input, id }
    officeHolidaysStore[index] = structuredClone(next)
    return structuredClone(next)
  }
  const created: OfficeHoliday = {
    ...input,
    id: `OH-${Date.now()}`,
  }
  officeHolidaysStore.push(structuredClone(created))
  return structuredClone(created)
}

export async function deleteOfficeHoliday(id: string): Promise<void> {
  await delay()
  officeHolidaysStore = officeHolidaysStore.filter((item) => item.id !== id)
}

export async function upsertOfficeEvent(
  input: OfficeCalendarEventInput,
  id?: string,
): Promise<OfficeCalendarEvent> {
  await delay()
  const normalized = normalizeEventInput(input)
  if (id) {
    const index = officeEventsStore.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Event not found')
    const next = { ...normalized, id }
    officeEventsStore[index] = structuredClone(next)
    return structuredClone(next)
  }
  const created: OfficeCalendarEvent = {
    ...normalized,
    id: `OE-${Date.now()}`,
  }
  officeEventsStore.push(structuredClone(created))
  return structuredClone(created)
}

export async function deleteOfficeEvent(id: string): Promise<void> {
  await delay()
  officeEventsStore = officeEventsStore.filter((item) => item.id !== id)
}

function normalizeEventInput(input: OfficeCalendarEventInput): OfficeCalendarEventInput {
  const endDate = input.endDate < input.startDate ? input.startDate : input.endDate
  if (input.allDay) {
    return {
      ...input,
      endDate,
      startTime: undefined,
      endTime: undefined,
    }
  }
  return { ...input, endDate }
}

function delay(ms = 120) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}