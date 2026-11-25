import { Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

import type {
  PermissionModule,
  RoleFormValues,
} from '../types/roleManagement.types'
import { PermissionGroupList } from './PermissionGroupList'

const DESCRIPTION_MAX = 500

type RoleFormDrawerProps = {
  open: boolean
  mode: 'create' | 'edit'
  values: RoleFormValues
  modules: PermissionModule[]
  permissionsLoading?: boolean
  nameReadOnly?: boolean
  submitting?: boolean
  permissionsHint?: string | null
  /** Overlay / X close — keep draft so reopen restores edits. */
  onDismiss: () => void
  /** Explicit Cancel — discard draft. */
  onCancel: () => void
  onChange: (values: RoleFormValues) => void
  onSubmit: () => void
}

export function RoleFormDrawer({
  open,
  mode,
  values,
  modules,
  permissionsLoading = false,
  nameReadOnly = false,
  submitting = false,
  permissionsHint = null,
  onDismiss,
  onCancel,
  onChange,
  onSubmit,
}: RoleFormDrawerProps) {
  const title = mode === 'create' ? 'Create New Role' : 'Edit Role'
  const submitLabel =
    mode === 'create'
      ? submitting
        ? 'Creating…'
        : 'Create Role'
      : submitting
        ? 'Saving…'
        : 'Save Changes'
  const canSubmit = values.name.trim().length > 0 && !submitting

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting) return
        if (!nextOpen) onDismiss()
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg md:max-w-xl"
      >
        <SheetHeader className="border-b border-border-soft px-4 py-5 pr-12 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-brand-500">
              <Shield className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <SheetTitle className="truncate text-xl font-bold text-navy">
              {title}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="role-name">
              Role Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="e.g. TEAM_LEAD"
              value={values.name}
              disabled={nameReadOnly || submitting}
              onChange={(event) =>
                onChange({ ...values, name: event.target.value })
              }
            />
            {nameReadOnly ? (
              <p className="text-xs text-text-secondary">
                System role codes cannot be changed. Display name edits are
                limited for system roles.
              </p>
            ) : (
              <p className="text-xs text-text-secondary">
                Saved as an UPPER_SNAKE_CASE code (e.g. TEAM_LEAD).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="role-description">Description</Label>
              <span className="text-xs text-text-secondary tabular-nums">
                {values.description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
            <Textarea
              id="role-description"
              placeholder="Enter role description..."
              maxLength={DESCRIPTION_MAX}
              value={values.description}
              disabled={submitting}
              onChange={(event) =>
                onChange({ ...values, description: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            {permissionsHint ? (
              <p className="text-xs text-text-secondary">{permissionsHint}</p>
            ) : null}
            <PermissionGroupList
              modules={modules}
              selectedIds={values.permissionIds}
              isLoading={permissionsLoading}
              onChange={(permissionIds) =>
                onChange({ ...values, permissionIds })
              }
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border-soft bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
