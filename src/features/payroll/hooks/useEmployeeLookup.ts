/**
 * Maps employee ids to display names from payroll context.
 * Used by Variable Pay and Final Settlement tables.
 */

import { useMemo } from 'react'

import { usePayroll } from './usePayroll'

export function useEmployeeLookup() {
  const { rawEmployees } = usePayroll()
  return useMemo(() => {
    const map = new Map<string, string>()
    rawEmployees.forEach((employee) => map.set(employee.id, employee.name))
    return (id: string) => map.get(id) ?? id
  }, [rawEmployees])
}
