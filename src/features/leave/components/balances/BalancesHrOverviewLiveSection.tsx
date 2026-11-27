/**
 * HR Balances: live org-wide overview from employee leave policies (hr-overview).
 */

import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import type { LeaveEmployee } from '../../types/employee'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { HrOverviewBalancesTable } from './HrOverviewBalancesTable'
import { useBalancesHrOverviewLive } from './useBalancesHrOverviewLive'

type BalancesHrOverviewLiveSectionProps = {
  search: string
  onSearchChange: (value: string) => void
  selectedEmployeeId: string | null
  onSelectEmployee: (employeeId: string | null, displayName?: string) => void
  snapshotEmployees?: LeaveEmployee[]
  orgLeaveTypes?: LeaveTypeOption[]
}

export function BalancesHrOverviewLiveSection({
  search,
  onSearchChange,
  selectedEmployeeId,
  onSelectEmployee,
  snapshotEmployees = [],
  orgLeaveTypes = [],
}: BalancesHrOverviewLiveSectionProps) {
  const vm = useBalancesHrOverviewLive(search, onSearchChange, snapshotEmployees, orgLeaveTypes)

  if (!vm.canFetch) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Employee balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-0 text-sm">
          {vm.errorMessage ? (
            <p className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900" role="alert">
              {vm.errorMessage}
            </p>
          ) : null}
          {vm.showMissingBalancesNotice ? (
            <p className="mx-5 mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-900" role="status">
              No leave balances for {vm.year} yet. Select an employee row to assign policies or apply company defaults,
              then refresh.
            </p>
          ) : null}
          {vm.isFetching ? <p className="px-5 py-4 text-xs text-hrms-text-muted">Loading employee balances…</p> : null}
          <div className="flex flex-wrap items-end gap-3 px-4 pb-2 pt-3">
            <p className="text-xs text-hrms-text-muted">Click a row to manage policies, balances, and adjustments.</p>
            <div className="ml-auto flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="balances-year">Year</Label>
                <Select
                  value={String(vm.year)}
                  onValueChange={(value) => vm.setYear(Number(value))}
                  disabled={vm.isFetching}
                >
                  <SelectTrigger id="balances-year" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vm.yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-1"
                disabled={vm.isFetching}
                onClick={() => void vm.refetch()}
              >
                <RefreshCw className={`h-4 w-4 ${vm.isFetching ? 'animate-spin' : ''}`} aria-hidden />
                Refresh
              </Button>
            </div>
          </div>
          <div className="px-4 pb-2">
            <LeaveTableFilters
              searchId="balances-live-search"
              searchPlaceholder="Search by name or employee ID"
              searchValue={search}
              onSearchChange={vm.handleSearchChange}
              showing={vm.rows.length}
              total={vm.total}
            />
          </div>
          <HrOverviewBalancesTable
            rows={vm.rows}
            typeCodes={vm.typeCodes}
            leaveTypeLabelByCode={vm.leaveTypeLabelByCode}
            selectedEmployeeId={selectedEmployeeId}
            isFetching={vm.isFetching}
            onSelectEmployee={onSelectEmployee}
            page={vm.page}
            totalPages={vm.totalPages}
            total={vm.total}
            canGoPrev={vm.canGoPrev}
            canGoNext={vm.canGoNext}
            onPageChange={vm.setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}