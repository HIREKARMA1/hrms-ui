import type { AttendanceStatus } from '../../../types/attendance'

const STATUS_STYLES: Record<
  AttendanceStatus,
  { bg: string; text: string; dot: string }
> = {
  Present: { bg: 'bg-[#E7F6EC]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
  Absent: { bg: 'bg-[#FDEAEA]', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
  Late: { bg: 'bg-[#FEF3DC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  'Half-Day': { bg: 'bg-[#FEF3DC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  'On Leave': { bg: 'bg-[#E6EFFE]', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' },
  Holiday: { bg: 'bg-[#E6EFFE]', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' },
  'Weekly Off': { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]', dot: 'bg-[#0F766E]' },
  'In Progress': { bg: 'bg-[#FEF3DC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
}

export function AttendancePolicyReportStatusBadge({ status }: { status: AttendanceStatus }) {
  const styles = STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.bg} ${styles.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden />
      {status}
    </span>
  )
}