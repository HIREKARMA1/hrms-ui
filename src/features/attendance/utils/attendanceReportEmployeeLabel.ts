import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'

export function attendanceReportEmployeeLabel(record: EmployeeRecord): string {
  const name = `${record.profile.firstName} ${record.profile.lastName}`.trim()
  const code = record.profile.employeeId
  return name ? `${name} (${code})` : code
}