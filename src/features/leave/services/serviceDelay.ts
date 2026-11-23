/**
 * Simulated network delay for leaveService facade methods.
 * Keeps loading states realistic in the UI-only module.
 */

import { LEAVE_SERVICE_DELAY_MS } from '../constants/leaveRules'

export function leaveDelay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, LEAVE_SERVICE_DELAY_MS)
  })
}
