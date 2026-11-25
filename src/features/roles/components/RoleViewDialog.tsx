import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import type {
  ManagedRole,
  PermissionModule,
} from '../types/roleManagement.types'
import { PermissionGroupList } from './PermissionGroupList'

type RoleViewDialogProps = {
  role: ManagedRole | null
  modules: PermissionModule[]
  permissionsLoading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (role: ManagedRole) => void
}

export function RoleViewDialog({
  role,
  modules,
  permissionsLoading = false,
  open,
  onOpenChange,
  onEdit,
}: RoleViewDialogProps) {
  if (!role) return null

  const knownCount = role.permissionIds.length
  const showDetailedPermissions = knownCount > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="min-w-0 border-b border-border-soft px-4 py-5 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2 pr-6">
            <DialogTitle className="max-w-full text-xl font-bold tracking-wide break-all text-navy">
              {role.name?.trim() || role.code}
            </DialogTitle>
            <Badge
              variant="secondary"
              className={cn(
                'shrink-0 border-0 font-medium',
                role.type === 'system'
                  ? 'bg-sky-50 text-sky-700'
                  : 'bg-[#F0EDFF] text-[#5938DB]',
              )}
            >
              {role.type === 'system' ? 'System' : 'Custom'}
            </Badge>
          </div>
          {role.name?.trim() && role.name.trim() !== role.code ? (
            <p className="font-mono text-xs tracking-wide break-all text-text-secondary uppercase">
              {role.code}
            </p>
          ) : null}
          <DialogDescription className="text-sm break-words text-text-secondary">
            {role.description || 'No description provided.'}
          </DialogDescription>
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-text-secondary">
            <span>
              Permissions:{' '}
              <span className="font-medium tabular-nums text-navy">
                {role.permissionCount}
              </span>
            </span>
            <span>
              Users:{' '}
              <span className="font-medium tabular-nums text-navy">
                {role.userCount}
              </span>
            </span>
          </div>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">Permissions</p>
            <p className="text-xs text-text-secondary tabular-nums">
              {showDetailedPermissions
                ? `${knownCount} selected`
                : `${role.permissionCount} assigned`}
            </p>
          </div>
          {showDetailedPermissions ? (
            <PermissionGroupList
              modules={modules}
              selectedIds={role.permissionIds}
              isLoading={permissionsLoading}
              onChange={() => undefined}
              readOnly
            />
          ) : (
            <div className="rounded-xl border border-border-soft bg-[#FAFBFD] px-3 py-4 text-sm text-text-secondary">
              This role has {role.permissionCount} permission
              {role.permissionCount === 1 ? '' : 's'}. Open Edit and save
              permissions to sync the detailed selection for this session.
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border-soft px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => {
              onOpenChange(false)
              onEdit(role)
            }}
          >
            Edit Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
