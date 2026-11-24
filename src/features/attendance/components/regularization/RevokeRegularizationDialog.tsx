/**
 * Revoke flow — DELETE /attendance/regularizations/{id} with reason body.
 */
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type RevokeRegularizationDialogProps = {
  open: boolean
  saving?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void | Promise<void>
}

export function RevokeRegularizationDialog({
  open,
  saving = false,
  onOpenChange,
  onConfirm,
}: RevokeRegularizationDialogProps) {
  const [reason, setReason] = useState('')

  const close = () => {
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke regularization</DialogTitle>
          <DialogDescription>
            Sends DELETE /attendance/regularizations/&#123;id&#125; with a reason. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="revoke-reason">Reason</Label>
          <Textarea
            id="revoke-reason"
            value={reason}
            disabled={saving}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" disabled={saving} onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || !reason.trim()}
            onClick={() => void onConfirm(reason.trim())}
          >
            {saving ? 'Revoking…' : 'Revoke'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}