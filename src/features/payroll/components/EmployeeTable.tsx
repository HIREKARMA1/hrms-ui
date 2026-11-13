/**
 * Searchable employee payroll table with department and status filters.
 * Used on PayrollPage; opens EmployeeDetailPanel on row selection.
 */

import type { MutableRefObject } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { PAYROLL_DEPARTMENTS } from '../constants/departments'
import { PAYMENT_STATUSES } from '../constants/paymentStatuses'
import { usePayroll } from '../hooks/usePayroll'
import type { PaymentStatus } from '../types/payroll'
import { EmployeeTableBody } from './EmployeeTableBody'
import { PayrollTableFilters } from './shared/PayrollTableFilters'
import { payrollThClass, payrollTheadClass } from './shared/payrollTableLayout'

type EmployeeTableProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  department: string
  onDepartmentChange: (value: string) => void
  statusFilter: PaymentStatus | 'all'
  onStatusFilterChange: (value: PaymentStatus | 'all') => void
  filteredEmployees: ReturnType<typeof usePayroll>['employees']
  returnFocusRef: MutableRefObject<HTMLTableRowElement | null>
}

export function EmployeeTable({
  searchQuery,
  onSearchChange,
  department,
  onDepartmentChange,
  statusFilter,
  onStatusFilterChange,
  filteredEmployees,
  returnFocusRef,
}: EmployeeTableProps) {
  const { employees, selectedEmployeeId, setSelectedEmployeeId } = usePayroll()

  function handleSelect(id: string, row: HTMLTableRowElement) {
    returnFocusRef.current = row
    setSelectedEmployeeId(id)
  }

  return (
    <Card>
      <CardHeader className="gap-3 border-b border-hrms-border pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-hrms-navy">Employee payroll</CardTitle>
          <CardDescription>Click a row to view breakdown and payment details</CardDescription>
        </div>
        <PayrollTableFilters
          searchId="payroll-search"
          searchLabel="Search employees"
          searchPlaceholder="Name or ID"
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          extraSelectId="payroll-department"
          extraSelectLabel="Department"
          extraSelectValue={department}
          extraSelectOptions={[
            { value: 'all', label: 'All departments' },
            ...PAYROLL_DEPARTMENTS.map((item) => ({ value: item, label: item })),
          ]}
          onExtraSelectChange={onDepartmentChange}
          statusId="payroll-status"
          statusValue={statusFilter}
          statusOptions={[
            { value: 'all', label: 'All statuses' },
            ...PAYMENT_STATUSES.map((status) => ({ value: status, label: status })),
          ]}
          onStatusChange={(value) => onStatusFilterChange(value as PaymentStatus | 'all')}
          showing={filteredEmployees.length}
          total={employees.length}
        />
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[920px] table-fixed text-left text-sm">
          <thead className={payrollTheadClass}>
            <tr>
              {['ID', 'Name', 'Department', 'Gross', 'PF', 'Tax', 'Net pay', 'Paid on', 'Status'].map(
                (heading) => (
                  <th
                    key={heading}
                    className={payrollThClass(
                      heading === 'Net pay' || heading === 'Gross' || heading === 'PF' || heading === 'Tax'
                        ? 'money'
                        : 'text',
                    )}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            <EmployeeTableBody
              employees={filteredEmployees}
              selectedEmployeeId={selectedEmployeeId}
              onSelect={handleSelect}
            />
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
