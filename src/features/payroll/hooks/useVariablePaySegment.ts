/**
 * Segmented control state for Overtime, Bonus, and Incentives sub-tabs.
 * Used inside VariablePayTab on PayrollPage.
 */

import { useCallback, useState, type KeyboardEvent } from 'react'

export const VARIABLE_PAY_SEGMENTS = ['Overtime', 'Bonus', 'Incentives'] as const
export type VariablePaySegmentId = (typeof VARIABLE_PAY_SEGMENTS)[number]

export function useVariablePaySegment(initial: VariablePaySegmentId = 'Overtime') {
  const [segment, setSegment] = useState<VariablePaySegmentId>(initial)

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const index = VARIABLE_PAY_SEGMENTS.indexOf(segment)
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setSegment(VARIABLE_PAY_SEGMENTS[(index + 1) % VARIABLE_PAY_SEGMENTS.length])
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setSegment(
          VARIABLE_PAY_SEGMENTS[
            (index - 1 + VARIABLE_PAY_SEGMENTS.length) % VARIABLE_PAY_SEGMENTS.length
          ],
        )
      }
    },
    [segment],
  )

  return { segment, setSegment, onKeyDown }
}
