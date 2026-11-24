/**
 * Create user (POST /users) with optional role assignment for Admin/HR.
 * Create alone always starts as EMPLOYEE; elevation needs users:assign_roles.
 */
import { Loader2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

import { useAppDispatch } from '@/app/store/hooks'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { userHoldsRole } from '@/features/rbac/utils/userRoles'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useListRolesQuery } from '@/features/roles/api/rolesApi'
import { useAssignUserRolesMutation, usersApi } from '../api/usersApi'
import type { BackendUser } from '../api/usersApi.types'
import {
  createSubmitGuard,
  submitRegisterUser,
} from '../utils/registerUser'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type CreateUserFormErrors,
} from '../utils/userFormValidation'

const EMPLOYEE_ONLY = '__employee_only__'

type CreateUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (user: BackendUser, detail: string) => void
}

export function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const { canAccess } = useOptionalFeatureAccess()
  const { user: actor } = useAuthenticatedUser()
  const rbac = useOptionalRbacSession()
  const canAssign = canAccess('users.assignRoles')
  const canReadRoles = canAccess('module.roles')
  const actorIsSuperAdmin = Boolean(
    actor && userHoldsRole(actor, 'SUPER_ADMIN'),
  )

  const [guard] = useState(createSubmitGuard)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [roleChoice, setRoleChoice] = useState(EMPLOYEE_ONLY)
  const [errors, setErrors] = useState<CreateUserFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const dispatch = useAppDispatch()
  const [assignRoles] = useAssignUserRolesMutation()
  const rolesQuery = useListRolesQuery(
    { page: 1, limit: 100, isActive: true },
    { skip: !open || !canAssign || !canReadRoles },
  )

  const assignableRoles = useMemo(() => {
    const items = rolesQuery.data?.items ?? []
    return items.filter((role) => {
      if (!role.isActive) return false
      if (role.code === 'EMPLOYEE') return false
      if (role.code === 'SUPER_ADMIN' && !actorIsSuperAdmin) return false
      return true
    })
  }, [actorIsSuperAdmin, rolesQuery.data?.items])

  const reset = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setEmployeeId('')
    setRoleChoice(EMPLOYEE_ONLY)
    setErrors({})
    setFormError(null)
    setBusy(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setBusy(true)

    const roleId = roleChoice === EMPLOYEE_ONLY ? null : roleChoice
    const outcome = await submitRegisterUser({
      email,
      password,
      confirmPassword,
      employeeId,
      roleId,
      guard,
      send: {
        // track: false so the password in originalArgs is not kept in the store.
        create: (body) =>
          dispatch(usersApi.endpoints.createUser.initiate(body, { track: false })),
        assignRoles: (arg) => assignRoles(arg),
      },
    })

    if (outcome.status === 'busy') return
    setBusy(false)

    if (outcome.status === 'invalid') {
      setErrors(outcome.errors)
      return
    }
    if (outcome.status === 'error') {
      setErrors({})
      setFormError(outcome.message)
      if (outcome.createdUser) {
        onCreated(
          outcome.createdUser,
          'User created as EMPLOYEE; role assignment failed.',
        )
        handleOpenChange(false)
      }
      return
    }

    onCreated(
      outcome.user,
      outcome.roleAssigned
        ? 'User created and role assigned.'
        : 'User created as EMPLOYEE.',
    )
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register user</DialogTitle>
          <DialogDescription>
            Creates an active account. New accounts always start with the EMPLOYEE role; choose an
            additional role below only if you can assign roles.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="create-user-email">Email</Label>
            <Input
              id="create-user-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-user-password">Password</Label>
            <PasswordInput
              id="create-user-password"
              autoComplete="new-password"
              value={password}
              maxLength={PASSWORD_MAX_LENGTH}
              onChange={(event) => {
                setPassword(event.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              error={Boolean(errors.password)}
            />
            {errors.password ? (
              <p className="text-xs text-red-500">{errors.password}</p>
            ) : (
              <p className="text-xs text-slate-500">
                {PASSWORD_MIN_LENGTH} to {PASSWORD_MAX_LENGTH} characters.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-user-confirm">Confirm password</Label>
            <PasswordInput
              id="create-user-confirm"
              autoComplete="new-password"
              value={confirmPassword}
              maxLength={PASSWORD_MAX_LENGTH}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              error={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-user-employee">Employee ID (optional)</Label>
            <Input
              id="create-user-employee"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              placeholder="Link an existing employee record"
            />
          </div>

          <Feature name="users.assignRoles">
            <Feature name="module.roles">
              <div className="space-y-2">
                <Label>Additional role</Label>
                <Select value={roleChoice} onValueChange={setRoleChoice} disabled={busy}>
                  <SelectTrigger>
                    <SelectValue placeholder="EMPLOYEE only" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPLOYEE_ONLY}>EMPLOYEE only (default)</SelectItem>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {rbac?.roleCode === 'HR_ADMIN'
                    ? 'You can only assign roles whose permissions you already hold.'
                    : 'SUPER_ADMIN may only be assigned by a Super Admin.'}
                </p>
              </div>
            </Feature>
          </Feature>

          {formError ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                'Create user'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
