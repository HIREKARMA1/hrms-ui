import type { KeyboardEvent } from 'react'

import type { MonthGridCell } from './monthGridUtils'

export function handleMonthGridKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  cells: MonthGridCell[],
  onSelectDate: (dateKey: string) => void,
) {
  const moves: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
  }
  const delta = moves[event.key]
  if (!delta) return
  event.preventDefault()
  const next = cells[index + delta]
  if (next) {
    onSelectDate(next.key)
    window.requestAnimationFrame(() => {
      document.getElementById(`office-cal-day-${next.key}`)?.focus()
    })
  }
}