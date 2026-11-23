import { ArrowLeft, CheckCircle2, IdCard, Mail } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { ADMIN_REQUEST_ISSUE_OPTIONS } from '../constants/issueOptions'
import { createAdminSupportRequest } from '../services/adminSupportStore'
import type { AdminRequestIssue } from '../types/adminSupportRequest'

import { SupportMockBanner } from './SupportMockBanner'

type FormErrors = {
  email?: string
  issues?: string
  otherDetail?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactAdministratorForm() {
  const [email, setEmail] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [issues, setIssues] = useState<Record<AdminRequestIssue, boolean>>({
    employee_id: false,
    password: false,
    other: false,
  })
  const [otherDetail, setOtherDetail] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  const toggleIssue = (key: AdminRequestIssue, checked: boolean) => {
    setIssues((prev) => ({ ...prev, [key]: checked }))
    if (errors.issues || errors.otherDetail) {
      setErrors((prev) => ({
        ...prev,
        issues: undefined,
        otherDetail: undefined,
      }))
    }
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      next.email = 'Work email is required.'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = 'Enter a valid email address.'
    }

    const selected = ADMIN_REQUEST_ISSUE_OPTIONS.filter(
      (opt) => issues[opt.value],
    ).map((opt) => opt.value)

    if (selected.length === 0) {
      next.issues = 'Select at least one issue type.'
    }

    if (issues.other && !otherDetail.trim()) {
      next.otherDetail = 'Please describe your issue under Other.'
    }

    return next
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const selectedIssues = ADMIN_REQUEST_ISSUE_OPTIONS.filter(
      (opt) => issues[opt.value],
    ).map((opt) => opt.value)

    const created = createAdminSupportRequest({
      email: email.trim(),
      employeeId: employeeId.trim() || undefined,
      issues: selectedIssues,
      otherDetail: issues.other ? otherDetail.trim() : undefined,
      note: note.trim() || undefined,
    })
    setSubmittedId(created.id)
  }

  if (submittedId) {
    return (
      <div className="relative w-full max-w-[460px]">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)] sm:p-9">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Request submitted
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Reference <span className="font-semibold text-slate-900">{submittedId}</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              HR will reply to{' '}
              <span className="font-medium text-slate-700">{email.trim()}</span> when your
              request has been reviewed.
            </p>
            <div className="mt-6 w-full">
              <SupportMockBanner scope="public" />
            </div>
            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[460px]">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.35)] sm:p-9">
        <div className="mb-6 flex flex-col items-center text-center">
          <HireKarmaMark className="mb-4 h-12 w-12 rounded-2xl" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Contact administrator
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Tell HR what you need. We&apos;ll reply to your email.
          </p>
        </div>

        <SupportMockBanner scope="public" />

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Work email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                aria-invalid={Boolean(errors.email)}
                className={cn('pl-10', errors.email && 'border-red-400 focus-visible:ring-red-200')}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-red-500">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-employee-id">Employee ID</Label>
            <div className="relative">
              <IdCard
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="contact-employee-id"
                name="employeeId"
                type="text"
                autoComplete="username"
                placeholder="Optional — include if login-related"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-slate-500">
              Include your employee ID if the request is about login or access.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-900">
              What do you need help with? <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-2">
              {ADMIN_REQUEST_ISSUE_OPTIONS.map((option) => {
                const checked = issues[option.value]
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors',
                      checked
                        ? 'border-brand-200 bg-brand-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleIssue(option.value, value === true)
                      }
                      aria-label={option.label}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {option.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
            {errors.issues ? (
              <p className="text-xs text-red-500">{errors.issues}</p>
            ) : null}
          </fieldset>

          {issues.other ? (
            <div className="space-y-2">
              <Label htmlFor="contact-other-detail">
                Describe your issue <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="contact-other-detail"
                value={otherDetail}
                onChange={(e) => {
                  setOtherDetail(e.target.value)
                  if (errors.otherDetail) {
                    setErrors((prev) => ({ ...prev, otherDetail: undefined }))
                  }
                }}
                rows={3}
                placeholder="Brief description for HR"
                aria-invalid={Boolean(errors.otherDetail)}
                className={errors.otherDetail ? 'border-red-400' : undefined}
              />
              {errors.otherDetail ? (
                <p className="text-xs text-red-500">{errors.otherDetail}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="contact-note">Additional details</Label>
            <Textarea
              id="contact-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional context for HR"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Submit request
          </Button>
        </form>

        <div className="mt-7 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}