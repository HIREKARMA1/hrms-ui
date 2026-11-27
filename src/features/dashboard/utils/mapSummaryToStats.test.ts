/**
 * Maps GET /dashboard/summary to workforce cards.
 */

import { describe, expect, it } from 'vitest'

import type { DashboardSummaryData } from '../types/dashboardSummary.types'
import { mapSummaryToStats } from './mapSummaryToStats'

const sample: DashboardSummaryData = {
  totalEmployees: 150,
  activeEmployees: 120,
  inactiveEmployees: 10,
  onLeaveEmployees: 12,
  probationEmployees: 8,
}

describe('mapSummaryToStats', () => {
  it('exposes all five API fields with live footline', () => {
    const stats = mapSummaryToStats(sample)
    expect(stats).toHaveLength(5)
    const byId = Object.fromEntries(stats.map((s) => [s.id, s]))
    expect(byId.total?.value).toBe('150')
    expect(byId.active?.value).toBe('120')
    expect(byId.leave?.value).toBe('12')
    expect(byId.probation?.value).toBe('8')
    expect(byId.terminated?.value).toBe('10')
    expect(byId.terminated?.label).toBe('Terminated')
    expect(byId.total?.footline).toContain('All employee records')
    expect(byId.total?.trend).toBeUndefined()
  })

  it('uses GET /employees/total for the Total card when provided', () => {
    const stats = mapSummaryToStats(sample, { totalEmployees: 152 })
    const total = stats.find((s) => s.id === 'total')
    expect(total?.value).toBe('152')
    expect(stats.find((s) => s.id === 'active')?.value).toBe('120')
  })

  it('uses GET /employees/active for the Active card when provided', () => {
    const stats = mapSummaryToStats(sample, { activeEmployees: 118 })
    expect(stats.find((s) => s.id === 'active')?.value).toBe('118')
    expect(stats.find((s) => s.id === 'active')?.footline).toContain('ACTIVE')
  })

  it('uses GET /employees/inactive for the Terminated card when provided', () => {
    const stats = mapSummaryToStats(sample, { inactiveEmployees: 9 })
    expect(stats.find((s) => s.id === 'terminated')?.value).toBe('9')
    expect(stats.find((s) => s.id === 'terminated')?.footline).toContain('TERMINATED')
  })
})