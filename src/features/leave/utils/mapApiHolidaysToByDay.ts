import type { HolidaysListData } from '../types/api/holidaysList.types'

export function mapApiHolidaysToByDay(data: HolidaysListData): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const item of data.items) {
    const date = (item.date ?? item.holidayDate ?? '').slice(0, 10)
    const name = (item.name ?? item.title ?? 'Holiday').trim()
    if (!date || !name) continue
    map.set(date, [...(map.get(date) ?? []), name])
  }
  return map
}