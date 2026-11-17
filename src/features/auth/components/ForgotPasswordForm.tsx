import { ArrowLeft, IdCard } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormErrors = {
  employeeId?: string
}

export function ForgotPasswordForm() {
  const [employeeId, setEmployeeId] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 4200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!employeeId.trim()) {
      setErrors({ employeeId: 'Employee ID is required.' })
      return
    }

    setErrors({})
    setToastMessage(
      'Your password request has been submitted. Please contact your HR administrator for further assistance.',
    )
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
          <HireKarmaMark className="mb-4 h-12 w-12 rounded-2xl" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Forgot Password
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your Employee ID to request a password reset
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-employee-id">Employee ID</Label>
            <div className="relative">
              <IdCard
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="forgot-employee-id"
                name="employeeId"
                type="text"
                autoComplete="username"
                placeholder="Enter your Employee ID"
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value)
                  if (errors.employeeId) {
                    setErrors({})
                  }
                }}
                aria-invalid={Boolean(errors.employeeId)}
                aria-describedby={
                  errors.employeeId ? 'forgot-employee-id-error' : undefined
                }
                className={cn(
                  'pl-10',
                  errors.employeeId &&
                    'border-red-400 focus-visible:ring-red-200',
                )}
              />
            </div>
            {errors.employeeId ? (
              <p id="forgot-employee-id-error" className="text-xs text-red-500">
                {errors.employeeId}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Request for Password
          </Button>
        </form>

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
