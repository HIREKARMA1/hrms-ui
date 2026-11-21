import { Loader2 } from 'lucide-react'
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

import { getUserErrorMessage, useDeactivateUserMutation } from '../api/usersApi'
import type { BackendUser } from '../api/usersApi.types'
import { createSubmitGuard } from '../utils/registerUser'

type DeactivateUserDialogProps = {
  user: BackendUser | null
  onOpenChange: (open: boolean) => void
  onDeactivated: (user: BackendUser, message: string) => void
}

export function DeactivateUserDialog({
  user,
  onOpenChange,
  onDeactivated,
}: DeactivateUserDialogProps) {
  const [deactivateUser] = useDeactivateUserMutation()
  const [guard] = useState(createSubmitGuard)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!user) return
    if (!guard.tryEnter()) return
    setBusy(true)
    setError(null)
    try {
      const updated = await deactivateUser(user.id).unwrap()
      onDeactivated(
        updated,
        updated.isActive
          ? 'User status unchanged.'
          : user.isActive
            ? 'User deactivated. Their other sessions were signed out.'
            : 'User was already inactive.',
      )
      onOpenChange(false)
    } catch (err) {
      setError(getUserErrorMessage(err, 'Could not deactivate this user.'))
    } finally {
      setBusy(false)
      guard.leave()
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deactivate user?</DialogTitle>
          <DialogDescription>
            {user ? (
              <>
                This sets <span className="font-medium text-navy">{user.email}</span> to inactive and
                revokes their refresh tokens. The account is not deleted.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {user && !user.isActive ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This user is already inactive. Confirming will keep them inactive (idempotent).
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={busy || !user}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Deactivating...
              </>
            ) : (
              'Deactivate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
