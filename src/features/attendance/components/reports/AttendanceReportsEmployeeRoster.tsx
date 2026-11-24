/**
 * GET /employees roster for Attendance Reports — search, copy code/id, fill live lookup.
 */
import { RefreshCw, Search } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'
import { getApiErrorMessage } from '@/services/api/errors'

import { useAttendanceReportsEmployeeRoster } from '../../hooks/useAttendanceReportsEmployeeRoster'
import { copyTextToClipboard } from '../../utils/copyTextToClipboard'
import { AttendanceReportsRosterPagination } from './AttendanceReportsRosterPagination'
import { AttendanceReportsRosterTable } from './AttendanceReportsRosterTable'

type AttendanceReportsEmployeeRosterProps = {
  onUseInReport: (record: EmployeeRecord) => void
  onCopy: (label: string) => void
}

export function AttendanceReportsEmployeeRoster({
  onUseInReport,
  onCopy,
}: AttendanceReportsEmployeeRosterProps) {
  const roster = useAttendanceReportsEmployeeRoster()
  const { active, page, rows, pageInfo, showPagination, pageSize, search, setSearch, skip, setSkip } =
    roster

  const onCopyField = useCallback(
    async (label: string, value: string) => {
      try {
        await copyTextToClipboard(value)
        onCopy(`${label} copied.`)
      } catch {
        onCopy('Could not copy to clipboard.')
      }
    },
    [onCopy],
  )

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="text-navy">Employee roster</CardTitle>
        <CardDescription>
          From GET /employees — copy code or HRMS id, or use in the live report below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              className="pl-9"
              placeholder="Search name, code, or id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={active.isFetching}
            onClick={() => void active.refetch()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${active.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {active.isError ? (
          <p className="text-sm text-red-600">
            {getApiErrorMessage(active.error, 'Could not load employees.')}
          </p>
        ) : null}

        {active.isFetching && !page ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <AttendanceReportsRosterTable
            rows={rows}
            onCopyField={(label, value) => void onCopyField(label, value)}
            onUseInReport={onUseInReport}
          />
        )}

        {showPagination && pageInfo ? (
          <AttendanceReportsRosterPagination
            pageInfo={pageInfo}
            pageSize={pageSize}
            skip={skip}
            isFetching={active.isFetching}
            onSkipChange={setSkip}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}