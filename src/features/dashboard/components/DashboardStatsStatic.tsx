import { DashboardStatsGrid } from './DashboardStatsGrid'
import { dashboardStats } from '../utils/sampleData'

/** Mock workforce summary for placeholder routes (no API). */
export function DashboardStatsStatic() {
  return <DashboardStatsGrid stats={dashboardStats} />
}