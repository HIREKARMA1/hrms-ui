/**
 * Consumes LeadsContext from LeadsProvider.
 */

import { useContext } from 'react'

import { LeadsContext } from '../context/leadsContext'

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) {
    throw new Error('useLeads must be used within LeadsProvider')
  }
  return ctx
}