/**
 * Confirm permanently deleting a lead (replaces window.confirm).
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Lead } from '../types/lead'
import {
  LEADS_DIALOG_HEADER_BAND,
  LEADS_DIALOG_SHELL,
  LEADS_SECONDARY_BUTTON,
} from './shared/leadsUi'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '@/features/payroll/components/shared/PayrollDialog'

type LeadDeleteConfirmDialogProps = {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function LeadDeleteConfirmDialog({
  lead,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: LeadDeleteConfirmDialogProps) {
  const label = lead?.companyName?.trim() || lead?.leadName?.trim() || lead?.email || 'this lead'

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="sm"
          className={cn('flex flex-col p-0', LEADS_DIALOG_SHELL)}
          aria-describedby="lead-delete-desc"
        >
          <div className={LEADS_DIALOG_HEADER_BAND}>
            <PayrollDialogHeader
              title="Delete lead?"
              description={`This permanently removes ${label} and cannot be undone.`}
              descriptionId="lead-delete-desc"
            />
          </div>
          <PayrollDialogBody>
            {lead ? (
              <dl className="grid gap-2 rounded-xl border border-hrms-border bg-hrms-page/60 px-3 py-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-hrms-text-muted">Company</dt>
                  <dd className="font-medium text-hrms-navy">{lead.companyName || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-hrms-text-muted">Contact</dt>
                  <dd className="font-medium text-hrms-navy">{lead.email}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-hrms-text-muted">Owner</dt>
                  <dd className="font-medium text-hrms-navy">
                    {lead.assignedEmployeeName ?? '—'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </PayrollDialogBody>
          <PayrollDialogFooter>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className={LEADS_SECONDARY_BUTTON}
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={loading || !lead}
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => void onConfirm()}
              >
                {loading ? 'Deleting…' : 'Delete lead'}
              </Button>
            </div>
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}
