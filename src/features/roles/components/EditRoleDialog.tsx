/**
 * Update role (PATCH /roles/:id). Code and isSystem are immutable.
 */
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useUpdateRoleMutation } from '../api/rolesApi'
import type { BackendRole } from '../api/rolesApi.types'
import {
  ROLE_DESCRIPTION_MAX,
  ROLE_NAME_MAX,
  type UpdateRoleFormErrors,
} from '../utils/roleFormValidation'
import { createSubmitGuard, submitUpdateRole } from '../utils/roleMutations'

type EditRoleDialogProps = {
  role: BackendRole | null
  onOpenChange: (open: boolean) => void
  onUpdated: (role: BackendRole) => void
}

function EditRoleForm({
  role,
  onUpdated,
  onClose,
}: {
  role: BackendRole
  onUpdated: (role: BackendRole) => void
  onClose: () => void
}) {
  const [updateRole] = useUpdateRoleMutation()
  const [name, setName] = useState(role.name)
  const [description, setDescription] = useState(role.description ?? '')
  const [clearDescription, setClearDescription] = useState(false)
  const [isActive, setIsActive] = useState(role.isActive)
  const [errors, setErrors] = useState<UpdateRoleFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const outcome = await submitUpdateRole({
      id: role.id,
      name,
      description,
      clearDescription,
      isActive,
      original: role,
      guard,
      send: (arg) => updateRole(arg),
    })
    setSubmitting(false)

    if (outcome.status === 'busy') return
    if (outcome.status === 'invalid') {
      setErrors(outcome.errors)
      return
    }
    if (outcome.status === 'error') {
      setFormError(outcome.message)
      return
    }

    onUpdated(outcome.role)
    onClose()
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{role.code}</Badge>
        {role.isSystem ? <Badge variant="secondary">System</Badge> : null}
        <Badge variant={role.isActive ? 'success' : 'secondary'}>
          {role.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-role-name">Name</Label>
        <Input
          id="edit-role-name"
          value={name}
          maxLength={ROLE_NAME_MAX}
          onChange={(event) => {
            setName(event.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          disabled={submitting}
        />
        {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-role-description">Description</Label>
        <Textarea
          id="edit-role-description"
          value={clearDescription ? '' : description}
          maxLength={ROLE_DESCRIPTION_MAX}
          disabled={submitting || clearDescription}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={clearDescription}
            onChange={(event) => setClearDescription(event.target.checked)}
            disabled={submitting}
          />
          Clear description
        </label>
        {errors.description ? (
          <p className="text-xs text-red-500">{errors.description}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          disabled={submitting || role.isSystem}
        />
        Active
        {role.isSystem ? (
          <span className="text-xs text-slate-400">(system roles cannot be deactivated)</span>
        ) : null}
      </label>

      {errors.form ? <p className="text-xs text-red-500">{errors.form}</p> : null}
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {formError}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditRoleDialog({ role, onOpenChange, onUpdated }: EditRoleDialogProps) {
  const open = Boolean(role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>
            Name, description, and active status can change. Code and system flag cannot.
          </DialogDescription>
        </DialogHeader>
        {role ? (
          <EditRoleForm
            key={`${role.id}:${role.name}:${role.description ?? ''}:${String(role.isActive)}`}
            role={role}
            onUpdated={onUpdated}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
