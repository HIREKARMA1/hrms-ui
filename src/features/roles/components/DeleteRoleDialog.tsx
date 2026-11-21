/**
 * Delete custom role (DELETE /roles/:id) with confirmation.
 * System roles and roles with assignments are blocked client-side and by the API.
 */
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

import { useDeleteRoleMutation } from '../api/rolesApi'
import type { BackendRole } from '../api/rolesApi.types'
import { createSubmitGuard, submitDeleteRole } from '../utils/roleMutations'

type DeleteRoleDialogProps = {
  role: BackendRole | null
  onOpenChange: (open: boolean) => void
  onDeleted: (role: BackendRole) => void
}

export function DeleteRoleDialog({ role, onOpenChange, onDeleted }: DeleteRoleDialogProps) {
  const [deleteRole] = useDeleteRoleMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  const open = Boolean(role)

  const handleClose = (next: boolean) => {
    if (submitting) return
    if (!next) setError(null)
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (!role) return
    setError(null)
    setSubmitting(true)
    const outcome = await submitDeleteRole({
      role,
      guard,
      send: (id) => deleteRole(id),
    })
    setSubmitting(false)

    if (outcome.status === 'busy') return
    if (outcome.status === 'blocked' || outcome.status === 'error') {
      setError(outcome.message)
      return
    }

    onDeleted(role)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete role</DialogTitle>
          <DialogDescription>
            {role ? (
              <>
                Permanently delete <strong>{role.name}</strong> ({role.code})? System roles and
                roles still assigned to users cannot be deleted.
              </>
            ) : (
              'Confirm role deletion.'
            )}
          </DialogDescription>
        </DialogHeader>

        {role?.isSystem ? (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            This is a system role and cannot be deleted.
          </p>
        ) : null}

        {role && role.userCount > 0 ? (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            This role is assigned to {role.userCount} user
            {role.userCount === 1 ? '' : 's'} and cannot be deleted until those assignments are
            removed.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            disabled={
              submitting || !role || role.isSystem || role.userCount > 0
            }
            onClick={() => void handleConfirm()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              'Delete role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
