import { IdCard, Layers } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getLandingRouteForRole } from '@/features/rbac/utils/roleRouteMap'
import { cn } from '@/lib/utils'

import { PasswordInput } from './PasswordInput'

type FormErrors = {
  employeeId?: string
  password?: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}

    if (!employeeId.trim()) {
      nextErrors.employeeId = 'Employee ID is required.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    return nextErrors
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    // UI preview: no real auth yet. HR role lands on the existing dashboard
    // reused at /hr/dashboard. Replace with backend role resolution later.
    const hrLanding = getLandingRouteForRole('MANAGER')
    setToastMessage('Signed in (UI preview). Redirecting to HR dashboard...')
    window.setTimeout(() => {
      navigate(hrLanding, { replace: true })
    }, 500)
  }

  return (
    <div className="relative w-full max-w-[420px]">
      {toastMessage ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-sm text-slate-700 shadow-lg"
        >
          {toastMessage}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)] sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Layers className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to your HRMS account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="employee-id">Employee ID</Label>
            <div className="relative">
              <IdCard
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="employee-id"
                name="employeeId"
                type="text"
                autoComplete="username"
                placeholder="Enter your Employee ID"
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value)
                  if (errors.employeeId) {
                    setErrors((prev) => ({ ...prev, employeeId: undefined }))
                  }
                }}
                aria-invalid={Boolean(errors.employeeId)}
                aria-describedby={
                  errors.employeeId ? 'employee-id-error' : undefined
                }
                className={cn(
                  'pl-10',
                  errors.employeeId &&
                    'border-red-400 focus-visible:ring-red-200',
                )}
              />
            </div>
            {errors.employeeId ? (
              <p id="employee-id-error" className="text-xs text-red-500">
                {errors.employeeId}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-600"
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
            />
            {errors.password ? (
              <p id="password-error" className="text-xs text-red-500">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label
              htmlFor="remember-me"
              className="cursor-pointer font-medium text-slate-600"
            >
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <a
            href="http://localhost:3000/#contact-administrator"
            className="font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            Contact Administrator
          </a>
        </p>
      </div>
    </div>
  )
}
