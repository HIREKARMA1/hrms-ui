/**
 * Search and filter state for the payroll employee table.
 * Used by EmployeeTable and StatusCards on PayrollPage.
 */

import { useMemo, useState } from 'react'

import type { EmployeeWithComputed, PaymentStatus } from '../types/payroll'

type UsePayrollFiltersOptions = {
  employees: EmployeeWithComputed[]
}

export function usePayrollFilters({ employees }: UsePayrollFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [statusCardFilter, setStatusCardFilter] =
    useState<PaymentStatus | null>(null)

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return employees.filter((employee) => {
      const matchesSearch =
        query.length === 0 ||
        employee.name.toLowerCase().includes(query) ||
        employee.id.toLowerCase().includes(query)
      const matchesDepartment =
        department === 'all' || employee.department === department
      const effectiveStatus = statusCardFilter ?? statusFilter
      const matchesStatus =
        effectiveStatus === 'all' || employee.status === effectiveStatus
      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [department, employees, searchQuery, statusCardFilter, statusFilter])

  function toggleStatusCard(status: PaymentStatus): void {
    setStatusCardFilter((current) => (current === status ? null : status))
  }

  return {
    searchQuery,
    setSearchQuery,
    department,
    setDepartment,
    statusFilter,
    setStatusFilter,
    statusCardFilter,
    toggleStatusCard,
    filteredEmployees,
  }
}
