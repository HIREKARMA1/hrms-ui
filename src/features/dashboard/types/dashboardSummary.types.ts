/** Payload of `GET /dashboard/summary` (inside the standard envelope `data`). */
export type DashboardSummaryData = {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  onLeaveEmployees: number
  probationEmployees: number
}