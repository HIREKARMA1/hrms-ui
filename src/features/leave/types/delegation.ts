/**
 * Approver delegation window so delegate sees pending approvals on behalf.
 * Used by Approvals tab and approvalService.
 */

export type Delegation = {
  id: string
  approverId: string
  delegateId: string
  fromDate: string
  toDate: string
}
