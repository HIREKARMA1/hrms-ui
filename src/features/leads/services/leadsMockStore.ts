/**
 * In-memory lead store until API is connected.
 */

import { mockLeadsSeed } from '../mocks/mockLeads'
import type { Lead } from '../types/lead'

export let leadsMockStore: Lead[] = structuredClone(mockLeadsSeed)

export function resetLeadsMockStore() {
  leadsMockStore = structuredClone(mockLeadsSeed)
}