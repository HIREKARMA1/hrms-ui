/**
 * Status chip below employee title in the payroll detail dialog.
 */

import type { EmployeeWithComputed } from '../../types/payroll'
import { StatusPill } from '../StatusPill'

type DetailPanelHeaderProps = {
  employee: EmployeeWithComputed
}

export function DetailPanelHeader({ employee }: DetailPanelHeaderProps) {
  return <StatusPill status={employee.status} className="mt-2 w-fit" />
}