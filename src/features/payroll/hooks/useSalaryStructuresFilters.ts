/**
 * Search and department filters for the salary structures table.
 * Used by SalaryStructuresTab.
 */

import { useMemo, useState } from 'react'

import type { SalaryStructure } from '../types/salaryStructure'
import { computeStructurePreview } from '../utils/computeStructurePreview'
import type { PayrollSettings } from '../types/payrollSettings'

type Options = {
  structures: SalaryStructure[]
  settings: PayrollSettings
  payrollMonth: string
}

export function useSalaryStructuresFilters({ structures, settings, payrollMonth }: Options) {
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState('all')

  const rows = useMemo(() => {
    return structures.map((structure) => {
      const preview = computeStructurePreview(settings, structure, payrollMonth)
      return {
        structure,
        gross: preview.gross,
        annualCtc: preview.annualCtc,
      }
    })
  }, [structures, settings, payrollMonth])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return rows.filter(({ structure }) => {
      const matchesSearch =
        query.length === 0 ||
        structure.employeeName.toLowerCase().includes(query) ||
        structure.id.toLowerCase().includes(query)
      const matchesDepartment = department === 'all' || structure.department === department
      return matchesSearch && matchesDepartment
    })
  }, [department, rows, searchQuery])

  return { searchQuery, setSearchQuery, department, setDepartment, filteredRows, allRows: rows }
}
