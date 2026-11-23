/**

 * Payroll domain types shared across hooks, utils, and UI components.

 * Used by the entire payroll feature under src/features/payroll.

 */



import type { StructureComponentValues } from './salaryStructure'
import type { VariablePayTotals } from './variablePay'



export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'On Hold'



export type PayrollStage =

  | 'Draft'

  | 'Under review'

  | 'Approved'

  | 'Processed'

  | 'Paid'



export type Department =

  | 'Engineering'

  | 'Product'

  | 'HR'

  | 'Finance'

  | 'Sales & Marketing'



export type PayrollEmployee = {

  id: string

  name: string

  department: Department

  structureId: string

  incomeTax: number

  unpaidLeaveDays: number

  loanRecovery: number

  status: PaymentStatus

  paidOn?: string

  referenceNumber?: string

  remarks?: string

  paymentMode?: string

  failureReason?: string

  joiningDate: string

}



export type ComputedPayroll = {

  fixedGross: number

  gross: number

  variablePay: VariablePayTotals

  annualCtc: number

  componentAmounts: StructureComponentValues

  employeePf: number

  employerPf: number

  employeeEsi: number

  employerEsi: number

  esiApplicable: boolean

  professionalTax: number

  unpaidLeaveDeduction: number

  totalDeductions: number

  netPay: number

}



export type EmployeeWithComputed = PayrollEmployee & ComputedPayroll



export type PayrollHistoryMonth = {

  monthLabel: string

  amount: number

  paidOn: string

  status: PaymentStatus

  isLate: boolean

}



export type TimelineStep = {

  label: string

  completed: boolean

  failed?: boolean

}



export type PayrollAlert = {

  id: string

  message: string

  tone: 'success' | 'warning' | 'danger' | 'info'

}



export type PayrollSummary = {

  employeeCount: number

  totalGross: number

  totalDeductions: number

  totalNet: number

  totalPf: number

  totalEmployerPf: number

  totalTds: number

  totalProfessionalTax: number

  statusCounts: Record<PaymentStatus, number>

}


