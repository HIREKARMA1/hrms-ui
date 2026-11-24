import type { ReactNode } from 'react'
import {
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Timer,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { AttendanceReportSummary } from '../../types/api/attendanceReport.types'
import { formatMinutesAsDuration } from '../../utils/attendanceReportDisplay'
import {
  policyCardClass,
  policyMutedText,
  policyPrimaryText,
  policySecondaryText,
} from './policyReport/attendancePolicyReportUi'

type AttendanceReportPeriodSummaryCardsProps = {
  summary?: AttendanceReportSummary
  fromDate?: string
  toDate?: string
  children?: ReactNode
}

type MetricConfig = {
  key: keyof AttendanceReportSummary
  label: string
  formatMinutes?: boolean
  icon: LucideIcon
  tileClass: string
  iconClass: string
}

const METRICS: MetricConfig[] = [
  {
    key: 'presentDays',
    label: 'Present days',
    icon: CheckCircle2,
    tileClass: 'bg-[#E7F6EC]',
    iconClass: 'text-[#16A34A]',
  },
  {
    key: 'absentDays',
    label: 'Absent days',
    icon: XCircle,
    tileClass: 'bg-[#FDEAEA]',
    iconClass: 'text-[#EF4444]',
  },
  {
    key: 'lateDays',
    label: 'Late days',
    icon: Clock,
    tileClass: 'bg-[#FEF3DC]',
    iconClass: 'text-[#B45309]',
  },
  {
    key: 'holidayDays',
    label: 'Holidays',
    icon: Calendar,
    tileClass: 'bg-[#E6EFFE]',
    iconClass: 'text-[#3B82F6]',
  },
  {
    key: 'weeklyOffDays',
    label: 'Weekly offs',
    icon: CalendarDays,
    tileClass: 'bg-[#F0EDFF]',
    iconClass: 'text-[#5938DB]',
  },
  {
    key: 'totalWorkedMinutes',
    label: 'Total worked',
    formatMinutes: true,
    icon: Briefcase,
    tileClass: 'bg-[#F0EDFF]',
    iconClass: 'text-[#5938DB]',
  },
  {
    key: 'totalLateMinutes',
    label: 'Total late',
    formatMinutes: true,
    icon: Timer,
    tileClass: 'bg-[#FEF3DC]',
    iconClass: 'text-[#B45309]',
  },
  {
    key: 'totalOvertimeMinutes',
    label: 'Total OT',
    formatMinutes: true,
    icon: TrendingUp,
    tileClass: 'bg-[#E6EFFE]',
    iconClass: 'text-[#3B82F6]',
  },
]

function formatRangeLabel(fromDate?: string, toDate?: string): string | null {
  if (!fromDate && !toDate) return null
  if (fromDate && toDate) return `${fromDate} → ${toDate}`
  return fromDate ?? toDate ?? null
}

export function AttendanceReportPeriodSummaryCards({
  summary,
  fromDate,
  toDate,
  children,
}: AttendanceReportPeriodSummaryCardsProps) {
  if (!summary) return null

  const rangeLabel = formatRangeLabel(fromDate, toDate)

  return (
    <div className={policyCardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6EF] px-[22px] py-4">
        <h3 className={`text-base font-semibold ${policyPrimaryText}`}>Period summary</h3>
        {rangeLabel ? <p className={`text-sm ${policyMutedText}`}>{rangeLabel}</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-4 p-[22px] min-[560px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {METRICS.map(({ key, label, formatMinutes, icon: Icon, tileClass, iconClass }) => {
          const value = summary[key]
          if (value === undefined) return null
          const display = formatMinutes ? formatMinutesAsDuration(value) : String(value)
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-[#E2E6EF] p-4"
            >
              <div
                className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] ${tileClass}`}
                aria-hidden
              >
                <Icon className={`h-5 w-5 ${iconClass}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-[12.5px] font-medium ${policySecondaryText}`}>{label}</p>
                <p className={`text-[22px] font-bold leading-tight ${policyPrimaryText}`}>{display}</p>
              </div>
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}