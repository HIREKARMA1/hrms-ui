import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { useAppDispatch } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { authApi } from '../api/authApi'
import { clearRefreshToken } from '../store/authSlice'
import {
  CHANGE_PASSWORD_SUCCESS_MESSAGE,
  createSubmitGuard,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  submitChangePassword,
  type ChangePasswordErrors,
} from '../utils/passwordChange'
import { PasswordInput } from './PasswordInput'

export function ChangePasswordForm() {
  const dispatch = useAppDispatch()
  const [guard] = useState(createSubmitGuard)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ChangePasswordErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const clearFieldError = (field: keyof ChangePasswordErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({})
    setFormError(null)
    setSucceeded(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const outcome = await submitChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
      guard,
      onRefreshRevoked: () => {
        dispatch(clearRefreshToken())
      },
      send: (arg) => dispatch(authApi.endpoints.changePassword.initiate(arg, { track: false })),
    })

    if (outcome.status === 'busy') return
    setIsSubmitting(false)

    if (outcome.status === 'invalid') {
      setErrors(outcome.errors)
      return
    }
    if (outcome.status === 'error') {
      setErrors({})
      setFormError(outcome.message)
      return
    }

    setErrors({})
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setSucceeded(true)
  }

  if (succeeded) {
    return (
      <div role="status" className="space-y-4 text-center sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-500" aria-hidden="true" />
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">{CHANGE_PASSWORD_SUCCESS_MESSAGE}</p>
            <p className="text-sm text-slate-600">
              You are still signed in on this device. Other sessions have been signed out. When this
              session expires you will need to sign in with your new password.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={resetForm}>
          Change password again
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="change-current-password">Current Password</Label>
        <PasswordInput
          id="change-current-password"
          name="currentPassword"
          autoComplete="current-password"
          placeholder="Enter your current password"
          maxLength={PASSWORD_MAX_LENGTH}
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value)
            clearFieldError('currentPassword')
          }}
          error={Boolean(errors.currentPassword)}
          aria-invalid={Boolean(errors.currentPassword)}
          aria-describedby={errors.currentPassword ? 'change-current-password-error' : undefined}
        />
        {errors.currentPassword ? (
          <p id="change-current-password-error" className="text-xs text-red-500">
            {errors.currentPassword}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="change-new-password">New Password</Label>
        <PasswordInput
          id="change-new-password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="Enter a new password"
          maxLength={PASSWORD_MAX_LENGTH}
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value)
            clearFieldError('newPassword')
          }}
          error={Boolean(errors.newPassword)}
          aria-invalid={Boolean(errors.newPassword)}
          aria-describedby={errors.newPassword ? 'change-new-password-error' : 'change-password-hint'}
        />
        {errors.newPassword ? (
          <p id="change-new-password-error" className="text-xs text-red-500">
            {errors.newPassword}
          </p>
        ) : (
          <p id="change-password-hint" className="text-xs text-slate-500">
            Use {PASSWORD_MIN_LENGTH} to {PASSWORD_MAX_LENGTH} characters. It must differ from your
            current password.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="change-confirm-password">Confirm New Password</Label>
        <PasswordInput
          id="change-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          maxLength={PASSWORD_MAX_LENGTH}
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            clearFieldError('confirmPassword')
          }}
          error={Boolean(errors.confirmPassword)}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? 'change-confirm-password-error' : undefined}
        />
        {errors.confirmPassword ? (
          <p id="change-confirm-password-error" className="text-xs text-red-500">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Updating...
          </>
        ) : (
          'Update Password'
        )}
      </Button>
    </form>
  )
}
