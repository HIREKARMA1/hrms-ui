/**
 * Compensatory off credit lots and earn requests awaiting manager approval.
 * Used by My Leave comp-off flow and compOffService.
 */

export type CompOffLotStatus = 'Available' | 'Used' | 'Expired'

export type CompOffLot = {
  id: string
  employeeId: string
  workedDate: string
  dayType: 'full' | 'half'
  creditedDays: number
  expiresOn: string
  status: CompOffLotStatus
  createdOn: string
}

export type CompOffRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export type CompOffRequest = {
  id: string
  employeeId: string
  workedDate: string
  dayType: 'full' | 'half'
  reason: string
  appliedOn: string
  status: CompOffRequestStatus
}
