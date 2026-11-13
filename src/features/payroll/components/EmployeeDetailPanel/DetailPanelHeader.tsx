/**

 * Employee identity header for the slide-in detail panel.

 * Used by EmployeeDetailPanel.

 */



import { SheetHeader, SheetTitle } from '@/components/ui/sheet'



import type { EmployeeWithComputed } from '../../types/payroll'

import { StatusPill } from '../StatusPill'



type DetailPanelHeaderProps = {

  employee: EmployeeWithComputed

}



export function DetailPanelHeader({ employee }: DetailPanelHeaderProps) {

  return (

    <SheetHeader className="gap-0 space-y-3">

      <SheetTitle className="pr-2 text-hrms-navy">{employee.name}</SheetTitle>

      <p className="text-sm text-hrms-text-secondary">

        {employee.id} · {employee.department}

      </p>

      <StatusPill status={employee.status} className="w-fit" />

    </SheetHeader>

  )

}


