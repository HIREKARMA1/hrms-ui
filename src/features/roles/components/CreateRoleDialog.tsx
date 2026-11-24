/**
 * Create custom role (POST /roles). System flag is never client-controlled.
 */
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

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

import { useCreateRoleMutation } from '../api/rolesApi'
import type { BackendRole } from '../api/rolesApi.types'
import {
  ROLE_DESCRIPTION_MAX,
  ROLE_NAME_MAX,
  type CreateRoleFormErrors,
} from '../utils/roleFormValidation'
import { createSubmitGuard, submitCreateRole } from '../utils/roleMutations'

type CreateRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (role: BackendRole) => void
}

export function CreateRoleDialog({ open, onOpenChange, onCreated }: CreateRoleDialogProps) {
  const [createRole] = useCreateRoleMutation()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<CreateRoleFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  const reset = () => {
    setCode('')
    setName('')
    setDescription('')
    setIsActive(true)
    setErrors({})
    setFormError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && submitting) return
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const outcome = await submitCreateRole({
      code,
      name,
      description,
      isActive,
      guard,
      send: (body) => createRole(body),
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

    reset()
    onCreated(outcome.role)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>
            Creates a custom (non-system) role. Role codes must be unique
            UPPER_SNAKE_CASE values.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="create-role-code">Code</Label>
            <Input
              id="create-role-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }))
              }}
              placeholder="e.g. TEAM_LEAD"
              autoComplete="off"
              disabled={submitting}
            />
            {errors.code ? <p className="text-xs text-red-500">{errors.code}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role-name">Name</Label>
            <Input
              id="create-role-name"
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
            <Label htmlFor="create-role-description">Description</Label>
            <Textarea
              id="create-role-description"
              value={description}
              maxLength={ROLE_DESCRIPTION_MAX}
              onChange={(event) => {
                setDescription(event.target.value)
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }))
                }
              }}
              disabled={submitting}
              rows={3}
            />
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={submitting}
            />
            Active
          </label>

          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                'Create role'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
