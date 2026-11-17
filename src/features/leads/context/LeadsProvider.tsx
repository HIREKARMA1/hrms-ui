/**
 * Leads data provider for LeadsPage subtree.
 */

import { useMemo, type ReactNode } from 'react'

import { useLeadsProviderState } from '../hooks/useLeadsProviderState'
import { LeadsContext, type LeadsContextValue } from './leadsContext'

export function LeadsProvider({ children }: { children: ReactNode }) {
  const state = useLeadsProviderState()
  const value = useMemo((): LeadsContextValue => state, [state])
  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
}