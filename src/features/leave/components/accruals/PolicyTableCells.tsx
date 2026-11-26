/**
 * Shared leave type and status cells for server policy tables.
 */

import type { BackendLeaveTypeRef } from '../../api/leaveApi.types'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'

export function policyTypeParts(ref: BackendLeaveTypeRef | null, fallbackId: string) {
  if (ref) return { code: ref.code.trim().toUpperCase(), name: ref.name }
  return { code: '', name: fallbackId }
}

export function PolicyLeaveTypeCell({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {code ? <LeaveTypeChip code={code} abbreviated /> : null}
      <span>{name}</span>
    </div>
  )
}

export function PolicyStatusCell({ active }: { active: boolean }) {
  return <LeaveStatusPill status={active ? 'Active' : 'Inactive'} />
}