/**
 * Overview banner explaining Super Admin scope within Leave Management.
 */

import { ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'

type SuperAdminScopeBannerProps = {
  onViewAudit: () => void
}

export function SuperAdminScopeBanner({ onViewAudit }: SuperAdminScopeBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hrms-primary/20 bg-hrms-lavender/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hrms-primary/10 text-hrms-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-hrms-navy">Super Admin view</p>
          <p className="text-sm text-hrms-text-secondary">
            Full HR leave controls plus audit history, access planning, and demo data reset.
          </p>
        </div>
      </div>
      <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON, 'shrink-0')} onClick={onViewAudit}>
        Open audit log
      </Button>
    </div>
  )
}
