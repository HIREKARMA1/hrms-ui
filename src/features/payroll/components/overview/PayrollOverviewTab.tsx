/**

 * Existing payroll overview content — layout unchanged from pre-tabs PayrollPage.

 * Rendered when the Overview page tab is active on PayrollPage.

 */



import { useRef } from 'react'



import { AlertList } from '../AlertList'

import { EmployeeDetailPanel } from '../EmployeeDetailPanel/EmployeeDetailPanel'

import { EmployeeTable } from '../EmployeeTable'

import { StatutoryTotals } from '../StatutoryTotals'

import { StatusCards } from '../StatusCards'

import { SummaryCards } from '../SummaryCards'

import { usePayroll } from '../../hooks/usePayroll'

import { usePayrollFilters } from '../../hooks/usePayrollFilters'



export function PayrollOverviewTab() {

  const { employees } = usePayroll()

  const filters = usePayrollFilters({ employees })

  const returnFocusRef = useRef<HTMLTableRowElement | null>(null)



  return (

    <div className="flex flex-col gap-4">

      <SummaryCards />

      <StatusCards

        activeStatus={filters.statusCardFilter}

        onToggle={filters.toggleStatusCard}

      />

      <StatutoryTotals />

      <AlertList />

      <EmployeeTable

        searchQuery={filters.searchQuery}

        onSearchChange={filters.setSearchQuery}

        department={filters.department}

        onDepartmentChange={filters.setDepartment}

        statusFilter={filters.statusFilter}

        onStatusFilterChange={filters.setStatusFilter}

        filteredEmployees={filters.filteredEmployees}

        returnFocusRef={returnFocusRef}

      />

      <EmployeeDetailPanel returnFocusRef={returnFocusRef} />

    </div>

  )

}

