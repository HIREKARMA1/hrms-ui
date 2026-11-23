import { ArrowLeft, Loader2 } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { authApi } from '../api/authApi'
import {
  createSubmitGuard,
  parseResetToken,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  RESET_LINK_MISSING_MESSAGE,
  submitResetPassword,
  type ResetPasswordErrors,
} from '../utils/passwordReset'
import { RESET_PASSWORD_PATH } from '../utils/sessionRedirect'
import { PasswordInput } from './PasswordInput'

function RequestNewLinkFooter() {
  return (
    <div className="mt-7 flex flex-col items-center gap-3">
      <Link
        to="/forgot-password"
        className="text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
      >
        Request a new reset link
      </Link>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Login
      </Link>
    </div>
  )
}

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [guard] = useState(createSubmitGuard)
  // Held in memory only. Read once from the emailed link, then removed from
  // the address bar so it does not stay in history or leak through referrers.
  const [token, setToken] = useState(() => parseResetToken(location.search))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (location.search) navigate(RESET_PASSWORD_PATH, { replace: true })
  }, [location.search, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const outcome = await submitResetPassword({
      token,
      newPassword,
      confirmPassword,
      guard,
      navigate,
      send: (arg) => dispatch(authApi.endpoints.resetPassword.initiate(arg, { track: false })),
    })

    if (outcome.status === 'busy') return
    setIsSubmitting(false)
    if (outcome.status === 'invalid') {
      setErrors(outcome.errors)
    } else if (outcome.status === 'missing-token') {
      setErrors({})
      setToken(null)
    } else if (outcome.status === 'error') {
      setErrors({})
      setFormError(outcome.message)
      // The token is single use: once rejected it can never work again.
      if (outcome.tokenRejected) setToken(null)
    }
  }

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)] sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <HireKarmaMark className="mb-4 h-12 w-12 rounded-2xl" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Choose a new password for your account
          </p>
        </div>

        {token ? (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="reset-new-password">New Password</Label>
              <PasswordInput
                id="reset-new-password"
                name="newPassword"
                autoComplete="new-password"
                placeholder="Enter a new password"
                maxLength={PASSWORD_MAX_LENGTH}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }))
                }}
                error={Boolean(errors.newPassword)}
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={errors.newPassword ? 'reset-new-password-error' : 'reset-password-hint'}
              />
              {errors.newPassword ? (
                <p id="reset-new-password-error" className="text-xs text-red-500">
                  {errors.newPassword}
                </p>
              ) : (
                <p id="reset-password-hint" className="text-xs text-slate-500">
                  Use {PASSWORD_MIN_LENGTH} to {PASSWORD_MAX_LENGTH} characters.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">Confirm Password</Label>
              <PasswordInput
                id="reset-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                maxLength={PASSWORD_MAX_LENGTH}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }}
                error={Boolean(errors.confirmPassword)}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
              />
              {errors.confirmPassword ? (
                <p id="reset-confirm-password-error" className="text-xs text-red-500">
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

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <>
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {formError ?? RESET_LINK_MISSING_MESSAGE}
            </p>
            <RequestNewLinkFooter />
          </>
        )}
      </div>
    </div>
  )
}
