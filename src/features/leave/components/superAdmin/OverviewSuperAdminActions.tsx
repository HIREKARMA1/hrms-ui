/**
 * Super Admin-only quick actions on HR Overview (demo data reset).
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { resetLeaveData } from '../../services/leaveService'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'

export function OverviewSuperAdminActions() {
  const { reload } = useLeave()
  const { showToast } = useLeaveToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function confirmReset() {
    setLoading(true)
    await resetLeaveData()
    await reload()
    setLoading(false)
    setOpen(false)
    showToast('Leave demo data reset to seed state.')
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(LEAVE_SECONDARY_BUTTON, 'border-hrms-danger/40 text-hrms-danger hover:bg-hrms-danger/5')}
        onClick={() => setOpen(true)}
      >
        Reset demo data
      </Button>
      <LeaveConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reset leave demo data?"
        description="Restores mock employees, requests, balances, and settings. This cannot be undone in the demo store."
        confirmLabel="Reset data"
        loading={loading}
        danger
        onConfirm={() => void confirmReset()}
      />
    </>
  )
}
