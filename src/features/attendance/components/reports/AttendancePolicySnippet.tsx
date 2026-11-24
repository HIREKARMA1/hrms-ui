import type { AttendanceReportResult } from '../../types/api/attendanceReport.types'
import { policyEntries } from '../../utils/attendanceReportPolicyLabels'

type AttendancePolicySnippetProps = {
  policy?: AttendanceReportResult['policy']
}

export function AttendancePolicySnippet({ policy }: AttendancePolicySnippetProps) {
  const entries = policyEntries(policy)
  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-navy">Office policy</h4>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {entries.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="font-medium text-navy">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}