/**
 * HR Balances: live org-wide overview from employee leave policies (hr-overview).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
          <p className="text-xs font-normal text-hrms-text-muted">
            Org-wide leave balances for {vm.year}. Select a row to assign policies, review balances, and post adjustments.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 p-0 text-sm">
          {vm.errorMessage ? (
            <p className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900" role="alert">
              {vm.errorMessage}
            </p>
          ) : null}
          {vm.showMissingBalancesNotice ? (
            <p className="mx-5 mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-900" role="status">
              Employees are listed, but no leave balances appear for {vm.year}. Assign leave policies or company defaults,
              then refresh this tab.
            </p>
          ) : null}
          {vm.isFetching ? <p className="px-5 py-4 text-xs text-hrms-text-muted">Loading employee balances…</p> : null}
          <div className="px-4 pb-2 pt-3">
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