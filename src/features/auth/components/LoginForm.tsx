/**
 * Login card UI aligned to the approved reference image.
 * Auth contract unchanged: POST /auth/login with email + password.
 * UI labels "Employee ID" per design; value is still submitted as `email`.
 */
import { Loader2, LogIn, User, Users } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useLoginMutation } from '../api/authApi'
import { clearCredentials } from '../store/authSlice'
import { normalizeAuthUser } from '../utils/authUser'
import { getLandingRouteForUserRole } from '../utils/landingRoute'
import { hasPasswordResetState, PASSWORD_RESET_DONE_MESSAGE } from '../utils/passwordReset'
import { getSafeReturnPath } from '../utils/returnPath'
import { HrmsBrandLockup } from './HrmsBrandLockup'
import { PasswordInput } from './PasswordInput'

type FormErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputShell =
  'h-11 rounded-xl border-[#E2E6EF] bg-white text-[#17213A] placeholder:text-[#98A2B3] focus-visible:border-[#14B8A6] focus-visible:ring-[#14B8A6]/25'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  /** Client-only; not shown in the reference UI — defaults off. */
  const rememberMe = false
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(() =>
    hasPasswordResetState(location.state) ? PASSWORD_RESET_DONE_MESSAGE : null,
  )

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Employee ID is required.'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid employee ID (email address).'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) return

    try {
      const session = await login({
        email: email.trim(),
        password,
        rememberMe,
      }).unwrap()

      const landing = getLandingRouteForUserRole(
        session.user.role,
        session.user.roles,
      )
      if (!landing) {
        dispatch(clearCredentials())
        setFormError('Your account role is not supported in this portal.')
        return
      }

      setToastMessage('Signed in. Redirecting...')
      const returnTo = getSafeReturnPath(
        location.state,
        normalizeAuthUser(session.user),
      )
      navigate(returnTo ?? landing, { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to sign in. Please try again.'))
    }
  }

  return (
    <div className="relative w-full max-w-[440px]">
      {toastMessage ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border border-[#CCFBF1] bg-white px-4 py-3 text-center text-sm text-[#17213A] shadow-lg"
        >
          {toastMessage}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-[#E2E6EF]/80 bg-white p-8 shadow-[0_24px_60px_-28px_rgba(23,33,58,0.35)] sm:p-10">
        <HrmsBrandLockup className="mb-8" compact />

        <div className="mb-7">
          <h2 className="text-3xl font-bold tracking-tight text-[#17213A]">
            Welcome Back
          </h2>
          <p className="mt-1.5 text-sm text-[#667085]">
            Sign in to your HRMS account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#17213A]">
              Employee ID
            </Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden="true"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Enter your employee ID"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={cn(
                  inputShell,
                  'pl-10',
                  errors.email && 'border-red-400 focus-visible:ring-red-200',
                )}
              />
            </div>
            {errors.email ? (
              <p id="email-error" className="text-xs text-red-500">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-[#17213A]">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#0F766E] transition-colors hover:text-[#115E59]"
              >
                Forgot Password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              error={Boolean(errors.password)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputShell}
            />
            {errors.password ? (
              <p id="password-error" className="text-xs text-red-500">
                {errors.password}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-[#0F766E] text-base font-semibold text-white shadow-[0_10px_24px_-12px_rgba(15,118,110,0.8)] transition-colors hover:bg-[#115E59] focus-visible:ring-[#14B8A6]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E2E6EF]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-[#667085]">
              Don&apos;t have an account?
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          asChild
          className="h-12 w-full rounded-xl border-[#14B8A6] bg-[#F0FDFA] text-base font-semibold text-[#0F766E] hover:bg-[#CCFBF1] hover:text-[#115E59]"
        >
          <Link to="/contact-administrator">
            <Users className="h-4 w-4" aria-hidden="true" />
            Contact Administrator
          </Link>
        </Button>
      </div>
    </div>
  )
}
