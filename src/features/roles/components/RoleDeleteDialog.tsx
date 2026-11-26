import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { ManagedRole } from '../types/roleManagement.types'

type RoleDeleteDialogProps = {
  role: ManagedRole | null
  open: boolean
  submitting?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function RoleDeleteDialog({
  role,
  open,
  submitting = false,
  onOpenChange,
  onConfirm,
}: RoleDeleteDialogProps) {
  const displayName = role?.name?.trim() || role?.code || 'this role'
  const blocked =
    Boolean(role?.isSystem) || Boolean(role && role.userCount > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden">
        <DialogHeader className="min-w-0 pr-6">
          <DialogTitle className="text-navy">Delete role?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-text-secondary">
              {role ? (
                <>
                  <p className="min-w-0">
                    This will permanently remove{' '}
                    <span className="font-semibold break-words text-navy">
                      {displayName}
                    </span>
                    .
                  </p>
                  {role.code && role.code !== displayName ? (
                    <p className="min-w-0 rounded-lg bg-[#FAFBFD] px-2.5 py-2 font-mono text-xs break-all text-text-secondary">
                      {role.code}
                    </p>
                  ) : null}
                  {role.isSystem ? (
                    <p>System roles cannot be deleted.</p>
                  ) : role.userCount > 0 ? (
                    <p>
                      This role is assigned to {role.userCount} user
                      {role.userCount === 1 ? '' : 's'} and cannot be deleted
                      until those assignments are removed.
                    </p>
                  ) : (
                    <p>This action cannot be undone.</p>
                  )}
                </>
              ) : (
                <p>This action cannot be undone.</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full bg-rose-600 text-white hover:bg-rose-700 sm:w-auto"
            disabled={submitting || blocked}
            onClick={onConfirm}
          >
            {submitting ? 'Deleting…' : 'Delete Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
