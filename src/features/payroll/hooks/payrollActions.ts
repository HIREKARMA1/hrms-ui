/**
 * Pure employee status update helpers for allowed payroll transitions.
 * Used by usePayroll when marking paid, hold, retry, or release.
 */

import { canTransition } from '../constants/paymentStatuses'
import type { PaymentStatus, PayrollEmployee } from '../types/payroll'
import { todayIsoDate } from '../utils/formatDate'

export function applyStatusChange(
  employees: PayrollEmployee[],
  employeeId: string,
  nextStatus: PaymentStatus,
): PayrollEmployee[] {
  return employees.map((employee) => {
    if (employee.id !== employeeId) {
      return employee
    }
    if (!canTransition(employee.status, nextStatus)) {
      return employee
    }

    if (nextStatus === 'Paid') {
      return {
        ...employee,
        status: 'Paid',
        paidOn: todayIsoDate(),
        referenceNumber: `UTR${Math.floor(10000000 + Math.random() * 89999999)}`,
        remarks: 'Payment credited successfully',
        failureReason: undefined,
      }
    }

    if (nextStatus === 'On Hold') {
      return {
        ...employee,
        status: 'On Hold',
        remarks: 'Salary placed on hold',
      }
    }

    if (nextStatus === 'Pending' && employee.status === 'Failed') {
      return {
        ...employee,
        status: 'Pending',
        failureReason: undefined,
        remarks: 'Payment queued for retry',
      }
    }

    if (nextStatus === 'Pending' && employee.status === 'On Hold') {
      return {
        ...employee,
        status: 'Pending',
        remarks: 'Hold released — pending payment',
      }
    }

    return { ...employee, status: nextStatus }
  })
}
