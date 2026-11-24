import { Check, Copy, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
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
import { getApiErrorMessage } from '@/services/api/errors'

import { useCreateOrganisationOnboardingAccountMutation } from '../api/organisationOnboardingApi'
import type { CreateOnboardingAccountResult } from '../api/organisationOnboardingApi.types'
import {
  buildOnboardingFormLink,
  copyTextToClipboard,
} from '../utils/onboardingFormLink'

type CreateOnboardingAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (result: CreateOnboardingAccountResult) => void
}

export function CreateOnboardingAccountDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOnboardingAccountDialogProps) {
  const [createAccount, createState] = useCreateOrganisationOnboardingAccountMutation()
  const [employeeCode, setEmployeeCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreateOnboardingAccountResult | null>(null)
  const [copied, setCopied] = useState(false)

  function resetForm() {
    setEmployeeCode('')
    setFirstName('')
    setDateOfBirth('')
    setEmail('')
    setFormError(null)
    setCreated(null)
    setCopied(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    onOpenChange(next)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!employeeCode.trim() || !firstName.trim() || !dateOfBirth || !email.trim()) {
      setFormError('Employee code, first name, date of birth, and email are required.')
      return
    }
    try {
      const result = await createAccount({
        employeeCode: employeeCode.trim(),
        firstName: firstName.trim(),
        dateOfBirth,
        email: email.trim().toLowerCase(),
      }).unwrap()
      setCreated(result)
      onCreated(result)
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not create onboarding account.'))
    }
  }

  async function handleCopyLink() {
    if (!created) return
    const ok = await copyTextToClipboard(buildOnboardingFormLink(created.onboardingId))
    setCopied(ok)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {created ? 'Account created' : 'Create temporary onboarding account'}
          </DialogTitle>
          <DialogDescription>
            {created
              ? 'Share the form link and temporary credentials with the candidate.'
              : 'Creates a temporary login. Password is FirstName@BirthYear (returned once).'}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Temporary account ready for {created.firstName} ({created.employeeCode}).
            </div>
            <div className="grid gap-3">
              <div>
                <Label>Email</Label>
                <Input className="mt-1.5" value={created.email} readOnly />
              </div>
              <div>
                <Label>Temporary password</Label>
                <Input className="mt-1.5 font-mono" value={created.password} readOnly />
              </div>
              <div>
                <Label>Form link</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    readOnly
                    value={buildOnboardingFormLink(created.onboardingId)}
                    className="font-mono text-xs"
                  />
                  <Button type="button" variant="outline" onClick={() => void handleCopyLink()}>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {created.emailDelivery?.sent === false ? (
                <p className="text-xs text-amber-700">
                  Welcome email was not sent
                  {created.emailDelivery.error
                    ? `: ${created.emailDelivery.error}`
                    : '.'}{' '}
                  Copy the link and credentials manually.
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <Label htmlFor="ob-emp-code">
                  Employee code <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="ob-emp-code"
                  className="mt-1.5"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="sm:col-span-1">
                <Label htmlFor="ob-first-name">
                  First name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="ob-first-name"
                  className="mt-1.5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label htmlFor="ob-dob">
                  Date of birth <span className="text-red-600">*</span>
                </Label>
                <div className="mt-1.5">
                  <DatePicker
                    id="ob-dob"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    placeholder="Select date of birth"
                    maxDate={new Date().toISOString().slice(0, 10)}
                    minDate="1950-01-01"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ob-email">
                  Email <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="ob-email"
                  type="email"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            {formError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createState.isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createState.isLoading}>
                {createState.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create account
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
