/**

 * Salary structures list table with search filters on the Structures tab.

 * Opens StructureDetailPanel when a row is selected.

 */



import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from '@/components/ui/card'



import { PAYROLL_DEPARTMENTS } from '../../constants/departments'

import { formatCurrency } from '../../utils/formatCurrency'

import { formatDate } from '../../utils/formatDate'

import type { useSalaryStructuresFilters } from '../../hooks/useSalaryStructuresFilters'

import { PayrollTableFilters } from '../shared/PayrollTableFilters'

import { PayrollTableColGroup } from '../shared/PayrollTableColGroup'

import {

  PAYROLL_TABLE_CLASS,

  PAYROLL_TABLE_WIDTHS,

  payrollTdClass,

  payrollThClass,

  payrollTheadClass,

  payrollTrClass,

} from '../shared/payrollTableLayout'



type SalaryStructuresTableProps = {

  filters: ReturnType<typeof useSalaryStructuresFilters>

  selectedStructureId: string | null

  onSelect: (structureId: string) => void

}



export function SalaryStructuresTable({

  filters,

  selectedStructureId,

  onSelect,

}: SalaryStructuresTableProps) {

  return (

    <Card>

      <CardHeader className="gap-3 border-b border-hrms-border pb-4">

        <div>

          <CardTitle className="text-base font-semibold text-hrms-navy">Salary structures</CardTitle>

          <CardDescription>One active structure per employee</CardDescription>

        </div>

        <PayrollTableFilters

          searchId="structure-search"

          searchLabel="Search structures"

          searchPlaceholder="Name or structure ID"

          searchValue={filters.searchQuery}

          onSearchChange={filters.setSearchQuery}

          extraSelectId="structure-dept"

          extraSelectLabel="Department"

          extraSelectValue={filters.department}

          extraSelectOptions={[

            { value: 'all', label: 'All departments' },

            ...PAYROLL_DEPARTMENTS.map((dept) => ({ value: dept, label: dept })),

          ]}

          onExtraSelectChange={filters.setDepartment}

          showing={filters.filteredRows.length}

          total={filters.allRows.length}

        />

      </CardHeader>

      <CardContent className="overflow-x-auto p-0">

        <table className={PAYROLL_TABLE_CLASS}>

          <PayrollTableColGroup widths={PAYROLL_TABLE_WIDTHS.salaryStructures} />

          <thead className={payrollTheadClass}>

            <tr>

              <th className={payrollThClass('text')}>ID</th>

              <th className={payrollThClass('text')}>Name</th>

              <th className={payrollThClass('text')}>Department</th>

              <th className={payrollThClass('money')}>Gross</th>

              <th className={payrollThClass('money')}>Annual CTC</th>

              <th className={payrollThClass('text')}>Effective from</th>

              <th className={payrollThClass('money')}>Revisions</th>

            </tr>

          </thead>

          <tbody>

            {filters.filteredRows.length === 0 ? (

              <tr>

                <td colSpan={7} className="py-8 text-center text-hrms-text-secondary">

                  No structures match your filters.

                </td>

              </tr>

            ) : (

              filters.filteredRows.map(({ structure, gross, annualCtc }) => (

                <tr

                  key={structure.id}

                  tabIndex={0}

                  className={`cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-hrms-focus ${payrollTrClass} ${

                    selectedStructureId === structure.id ? 'bg-hrms-lavender/50' : ''

                  }`}

                  onClick={() => onSelect(structure.id)}

                  onKeyDown={(event) => {

                    if (event.key === 'Enter' || event.key === ' ') {

                      event.preventDefault()

                      onSelect(structure.id)

                    }

                  }}

                >

                  <td className={payrollTdClass('text', false, 'secondary')}>{structure.id}</td>

                  <td className={payrollTdClass('text', true, 'name')} title={structure.employeeName}>

                    {structure.employeeName}

                  </td>

                  <td className={payrollTdClass('text', true, 'secondary')} title={structure.department}>

                    {structure.department}

                  </td>

                  <td className={payrollTdClass('money', false, 'keyMoney')}>{formatCurrency(gross)}</td>

                  <td className={payrollTdClass('money')}>{formatCurrency(annualCtc)}</td>

                  <td className={payrollTdClass('text', false, 'secondary')}>{formatDate(structure.effectiveFrom)}</td>

                  <td className={payrollTdClass('money', false, 'secondary')}>{structure.revisionCount}</td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </CardContent>

    </Card>

  )

}

