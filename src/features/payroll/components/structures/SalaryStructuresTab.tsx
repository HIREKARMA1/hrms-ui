/**
 * Salary structures list and detail panel on the Structures page tab.
 * Rendered from PayrollPage when the Structures tab is active.
 */

import { useMemo, useState } from 'react'

import { usePayroll } from '../../hooks/usePayroll'
import { useSalaryStructuresFilters } from '../../hooks/useSalaryStructuresFilters'
import { SalaryStructuresTable } from './SalaryStructuresTable'
import { StructureDetailPanel } from './StructureDetailPanel'

export function SalaryStructuresTab() {
  const { settings, structures, payrollMonth } = usePayroll()
  const filters = useSalaryStructuresFilters({ structures, settings, payrollMonth })
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null)

  const selectedStructure = useMemo(
  () => structures.find((item) => item.id === selectedStructureId) ?? null,
    [selectedStructureId, structures],
  )

  return (
    <>
      <SalaryStructuresTable
        filters={filters}
        selectedStructureId={selectedStructureId}
        onSelect={setSelectedStructureId}
      />
      <StructureDetailPanel
        structure={selectedStructure}
        onClose={() => setSelectedStructureId(null)}
      />
    </>
  )
}
