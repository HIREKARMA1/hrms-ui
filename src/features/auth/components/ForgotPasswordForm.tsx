import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAppDispatch } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { authApi } from '../api/authApi'
import {
  createSubmitGuard,
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  submitForgotPassword,
  type ForgotPasswordErrors,
} from '../utils/passwordReset'

export function ForgotPasswordForm() {
  const dispatch = useAppDispatch()
  const [guard] = useState(createSubmitGuard)
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<ForgotPasswordErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const outcome = await submitForgotPassword({
      email,
      guard,
      send: (arg) => dispatch(authApi.endpoints.forgotPassword.initiate(arg, { track: false })),
    })

    if (outcome.status === 'busy') return
    setIsSubmitting(false)
    if (outcome.status === 'invalid') {
      setErrors(outcome.errors)
    } else if (outcome.status === 'error') {
      setErrors({})
      setFormError(outcome.message)
    } else {
      setErrors({})
      setSubmitted(true)
    }
  }

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)] sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <HireKarmaMark className="mb-4 h-12 w-12 rounded-2xl" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Forgot Password
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your email address to request a password reset
          </p>
        </div>

        {submitted ? (
          <div role="status" className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" aria-hidden="true" />
            <p className="text-sm text-slate-600">{FORGOT_PASSWORD_SUCCESS_MESSAGE}</p>
            <p className="text-xs text-slate-500">
              Check your inbox and spam folder. The link works only for a short time.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false)
                setEmail('')
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (errors.email) setErrors({})
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'forgot-email-error' : undefined}
                  className={cn(
                    'pl-10',
                    errors.email && 'border-red-400 focus-visible:ring-red-200',
                  )}
                />
              </div>
              {errors.email ? (
                <p id="forgot-email-error" className="text-xs text-red-500">
                  {errors.email}
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
                  Sending...
                </>
              ) : (
                'Request Password Reset'
              )}
            </Button>
          </form>
        )}

        <div className="mt-7 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
