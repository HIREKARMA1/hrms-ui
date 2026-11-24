import type { AttendanceReportResult } from '../../../types/api/attendanceReport.types'
import { policySecondaryText, policyPrimaryText } from './attendancePolicyReportUi'

type AttendancePolicyReportEmployeeStripProps = {
  data: AttendanceReportResult
  dayCount: number
}

function initials(fullName?: string): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function MetaChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`rounded-full border border-[#E2E6EF] bg-white px-3 py-1 text-xs font-medium text-[#17213A] ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

export function AttendancePolicyReportEmployeeStrip({
  data,
  dayCount,
}: AttendancePolicyReportEmployeeStripProps) {
  const name = data.employee?.fullName?.trim()
  if (!name) return null

  const sourceLabel = data.source ?? 'live'
  const isLiveSource = sourceLabel.toLowerCase() === 'live'

  return (
    <div className="flex flex-col gap-4 border-t border-[#E2E6EF] bg-[#F7F8FC] px-[22px] py-[18px] rounded-b-[14px] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#F0EDFF] text-sm font-semibold text-[#5938DB]"
          aria-hidden
        >
          {initials(name)}
        </div>
        <div>
          <p className={`text-[15px] font-semibold ${policyPrimaryText}`}>{name}</p>
          {data.employee?.designation ? (
            <p className={`text-sm ${policySecondaryText}`}>{data.employee.designation}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <MetaChip>
          {dayCount} day{dayCount === 1 ? '' : 's'}
        </MetaChip>
        {data.employeeCode ? <MetaChip>Code: {data.employeeCode}</MetaChip> : null}
        {data.employeeId ? (
          <MetaChip>
            ID: <span className="font-mono text-[11px]">{data.employeeId}</span>
          </MetaChip>
        ) : null}
        <span
          className={
            isLiveSource
              ? 'rounded-full bg-[#E7F6EC] px-3 py-1 text-xs font-semibold text-[#16A34A]'
              : 'rounded-full border border-[#E2E6EF] bg-white px-3 py-1 text-xs font-medium text-[#17213A]'
          }
        >
          Source: {sourceLabel}
        </span>
      </div>
    </div>
  )
}