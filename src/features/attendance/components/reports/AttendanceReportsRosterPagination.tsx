/**
 * Pager for Attendance Reports employee roster.
 */
import { Button } from '@/components/ui/button'
import type { PageInfo } from '@/features/employees/api/employeeMappers'

type AttendanceReportsRosterPaginationProps = {
  pageInfo: PageInfo
  pageSize: number
  skip: number
  isFetching: boolean
  onSkipChange: (next: number) => void
}

export function AttendanceReportsRosterPagination({
  pageInfo,
  pageSize,
  skip,
  isFetching,
  onSkipChange,
}: AttendanceReportsRosterPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-secondary">
      <span>
        Showing {pageInfo.from}–{pageInfo.to} of {pageInfo.total}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={skip === 0 || isFetching}
          onClick={() => onSkipChange(Math.max(0, skip - pageSize))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!pageInfo.hasNext || isFetching}
          onClick={() => onSkipChange(skip + pageSize)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}