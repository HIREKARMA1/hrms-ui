import { CheckCircle2, Loader2, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useLoginOrganisationOnboardingFormMutation,
  useSubmitOrganisationOnboardingFormMutation,
  useUploadOrganisationOnboardingFileMutation,
} from '../api/organisationOnboardingApi'
import { organisationOnboardingFormSchema } from '../validation/onboardingForm.schema'

type FormState = {
  email: string
  password: string
  firstName: string
  lastName: string
  professionalIdentity: string
  phone: string
  aadhaar: string
  pan: string
  bloodGroup: string
  photoUrl: string
  uanNumber: string
  salarySlipUrls: string[]
  relievingLetterUrl: string
  sameAsPermanent: boolean
  permanentLine1: string
  permanentLine2: string
  permanentCity: string
  permanentState: string
  permanentPincode: string
  permanentCountry: string
  currentLine1: string
  currentLine2: string
  currentCity: string
  currentState: string
  currentPincode: string
  currentCountry: string
  accountHolderName: string
  accountNumber: string
  ifsc: string
  bankName: string
  branch: string
}

const INITIAL: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  professionalIdentity: '',
  phone: '',
  aadhaar: '',
  pan: '',
  bloodGroup: '',
  photoUrl: '',
  uanNumber: '',
  salarySlipUrls: [],
  relievingLetterUrl: '',
  sameAsPermanent: true,
  permanentLine1: '',
  permanentLine2: '',
  permanentCity: '',
  permanentState: '',
  permanentPincode: '',
  permanentCountry: 'India',
  currentLine1: '',
  currentLine2: '',
  currentCity: '',
  currentState: '',
  currentPincode: '',
  currentCountry: 'India',
  accountHolderName: '',
  accountNumber: '',
  ifsc: '',
  bankName: '',
  branch: '',
}

const FILE_ACCEPT = 'image/*,.pdf,.doc,.docx,application/pdf'

function RequiredMark() {
  return <span className="text-red-600">*</span>
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  id,
  label,
  required,
  children,
  className,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <>
            {' '}
            <RequiredMark />
          </>
        ) : null}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <HireKarmaMark className="h-14 w-14 rounded-2xl" />
      <div>
        <p className="text-sm font-semibold tracking-wide text-brand-600">HireKarma HRMS</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Organisation onboarding
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{subtitle}</p>
        ) : null}
      </div>
    </header>
  )
}

export function OrganisationOnboardingFormPage() {
  const { onboardingId = '' } = useParams()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [authenticated, setAuthenticated] = useState(false)
  const [candidateName, setCandidateName] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loginError, setLoginError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const [loginForm, loginState] = useLoginOrganisationOnboardingFormMutation()
  const [submitForm, submitState] = useSubmitOrganisationOnboardingFormMutation()
  const [uploadFile] = useUploadOrganisationOnboardingFileMutation()

  const canUpload = useMemo(
    () => Boolean(authenticated && onboardingId && form.email.trim() && form.password),
    [authenticated, onboardingId, form.email, form.password],
  )

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoginError(null)
    if (!form.email.trim() || !form.password) {
      setLoginError('Email and password are required.')
      return
    }
    try {
      const result = await loginForm({
        onboardingId,
        body: {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        },
      }).unwrap()
      setCandidateName(result.firstName)
      set('firstName', result.firstName)
      set('email', result.email)
      setAuthenticated(true)
    } catch (error) {
      setLoginError(getApiErrorMessage(error, 'Invalid email or password.'))
    }
  }

  async function handleUploadSingle(
    field: 'photoUrl' | 'relievingLetterUrl',
    event: ChangeEvent<HTMLInputElement>,
    folder: string,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!canUpload) {
      setErrors(['Sign in with your temporary credentials before uploading files.'])
      return
    }
    setUploading(field)
    setErrors([])
    try {
      const result = await uploadFile({
        onboardingId,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        file,
        folder,
      }).unwrap()
      set(field, result.assetUrl)
    } catch (error) {
      setErrors([getApiErrorMessage(error, 'Upload failed.')])
    } finally {
      setUploading(null)
    }
  }

  async function handleSalarySlipUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return
    if (!canUpload) {
      setErrors(['Sign in with your temporary credentials before uploading files.'])
      return
    }
    setUploading('salarySlipUrls')
    setErrors([])
    const uploaded: string[] = []
    try {
      for (const file of files) {
        const result = await uploadFile({
          onboardingId,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          file,
          folder: 'salary-slips',
        }).unwrap()
        uploaded.push(result.assetUrl)
      }
      set('salarySlipUrls', [...form.salarySlipUrls, ...uploaded])
    } catch (error) {
      if (uploaded.length > 0) {
        set('salarySlipUrls', [...form.salarySlipUrls, ...uploaded])
      }
      setErrors([getApiErrorMessage(error, 'One or more salary slip uploads failed.')])
    } finally {
      setUploading(null)
    }
  }

  function removeSalarySlip(url: string) {
    set(
      'salarySlipUrls',
      form.salarySlipUrls.filter((item) => item !== url),
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors([])

    const permanentAddress = {
      line1: form.permanentLine1,
      line2: form.permanentLine2 || undefined,
      city: form.permanentCity,
      state: form.permanentState,
      pincode: form.permanentPincode,
      country: form.permanentCountry || 'India',
    }
    const currentAddress = form.sameAsPermanent
      ? permanentAddress
      : {
          line1: form.currentLine1,
          line2: form.currentLine2 || undefined,
          city: form.currentCity,
          state: form.currentState,
          pincode: form.currentPincode,
          country: form.currentCountry || 'India',
        }

    const parsed = organisationOnboardingFormSchema.safeParse({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      professionalIdentity: form.professionalIdentity,
      phone: form.phone,
      aadhaar: form.aadhaar,
      pan: form.pan,
      bloodGroup: form.bloodGroup,
      photoUrl: form.photoUrl,
      uanNumber: form.uanNumber || undefined,
      salarySlipUrls: form.salarySlipUrls,
      relievingLetterUrl: form.relievingLetterUrl || undefined,
      permanentAddress,
      currentAddress,
      bankDetail: {
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        bankName: form.bankName,
        branch: form.branch || undefined,
      },
    })

    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message))
      return
    }

    const data = parsed.data
    try {
      await submitForm({
        onboardingId,
        body: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          professionalIdentity: data.professionalIdentity,
          phone: data.phone,
          aadhaar: data.aadhaar,
          pan: data.pan,
          bloodGroup: data.bloodGroup,
          photoUrl: data.photoUrl,
          ...(data.uanNumber ? { uanNumber: data.uanNumber } : {}),
          ...(data.salarySlipUrls?.length
            ? { salarySlipUrls: data.salarySlipUrls }
            : {}),
          ...(data.relievingLetterUrl
            ? { relievingLetterUrl: data.relievingLetterUrl }
            : {}),
          permanentAddress: {
            line1: data.permanentAddress.line1,
            line2: data.permanentAddress.line2 || undefined,
            city: data.permanentAddress.city,
            state: data.permanentAddress.state,
            pincode: data.permanentAddress.pincode,
            country: data.permanentAddress.country || 'India',
          },
          currentAddress: data.currentAddress
            ? {
                line1: data.currentAddress.line1,
                line2: data.currentAddress.line2 || undefined,
                city: data.currentAddress.city,
                state: data.currentAddress.state,
                pincode: data.currentAddress.pincode,
                country: data.currentAddress.country || 'India',
              }
            : undefined,
          bankDetail: {
            accountHolderName: data.bankDetail.accountHolderName,
            accountNumber: data.bankDetail.accountNumber,
            ifsc: data.bankDetail.ifsc,
            bankName: data.bankDetail.bankName,
            branch: data.bankDetail.branch || undefined,
          },
        },
      }).unwrap()
      setSubmitted(true)
    } catch (error) {
      setErrors([getApiErrorMessage(error, 'Could not submit the form.')])
    }
  }

  if (!onboardingId) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Invalid onboarding link.</p>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e8f0fe_0%,_#f8fafc_55%,_#f1f5f9_100%)] px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <HireKarmaMark className="mx-auto mb-4 h-14 w-14 rounded-2xl" />
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Form submitted</h1>
          <p className="mt-2 text-sm text-slate-600">
            Thank you. HR will review your details and documents. You can close this page.
          </p>
        </div>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-svh bg-[radial-gradient(ellipse_at_top,_#e8f0fe_0%,_#f8fafc_45%,_#f1f5f9_100%)]">
        <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6 sm:py-16">
          <BrandHeader subtitle="Sign in with the temporary email and password from your invitation to open your onboarding form." />
          <form
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
            onSubmit={(e) => void handleLogin(e)}
          >
            <h2 className="text-lg font-semibold text-slate-900">Candidate sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              Only this onboarding invite can unlock the form.
            </p>
            <div className="mt-5 space-y-4">
              <Field id="login-email" label="Email" required>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field id="login-password" label="Password" required>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </Field>
              {loginError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loginError}
                </p>
              ) : null}
              <Button type="submit" className="w-full" size="lg" disabled={loginState.isLoading}>
                {loginState.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue to form
              </Button>
            </div>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_top,_#e8f0fe_0%,_#f8fafc_45%,_#f1f5f9_100%)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <BrandHeader
          subtitle={`Signed in as ${candidateName || form.firstName || form.email}. Complete every required field so HR can verify your documents.`}
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="text-slate-600">
            Session for <span className="font-medium text-slate-900">{form.email}</span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAuthenticated(false)
              set('password', '')
              setCandidateName('')
            }}
          >
            <X className="mr-1 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)} noValidate>
          <SectionCard title="Personal details">
            <Field id="ob-first" label="First name" required>
              <Input
                id="ob-first"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </Field>
            <Field id="ob-last" label="Last name" required>
              <Input
                id="ob-last"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </Field>
            <Field id="ob-prof" label="Professional identity" required className="sm:col-span-2">
              <Input
                id="ob-prof"
                value={form.professionalIdentity}
                onChange={(e) => set('professionalIdentity', e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </Field>
            <Field id="ob-phone" label="Phone" required>
              <Input
                id="ob-phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </Field>
            <Field id="ob-blood" label="Blood group" required>
              <Input
                id="ob-blood"
                value={form.bloodGroup}
                onChange={(e) => set('bloodGroup', e.target.value)}
                placeholder="e.g. B+"
              />
            </Field>
          </SectionCard>

          <SectionCard title="Identity documents">
            <Field id="ob-aadhaar" label="Aadhaar" required>
              <Input
                id="ob-aadhaar"
                inputMode="numeric"
                maxLength={12}
                value={form.aadhaar}
                onChange={(e) => set('aadhaar', e.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Field id="ob-pan" label="PAN" required>
              <Input
                id="ob-pan"
                maxLength={10}
                value={form.pan}
                onChange={(e) => set('pan', e.target.value.toUpperCase())}
              />
            </Field>
            <Field id="ob-uan" label="UAN number">
              <Input
                id="ob-uan"
                value={form.uanNumber}
                onChange={(e) => set('uanNumber', e.target.value)}
              />
            </Field>
            <Field id="ob-photo" label="Photo" required className="sm:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  {uploading === 'photoUrl' ? 'Uploading…' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!uploading}
                    onChange={(e) => void handleUploadSingle('photoUrl', e, 'photos')}
                  />
                </label>
                {form.photoUrl ? (
                  <a
                    href={form.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm text-brand-600 underline"
                  >
                    Preview uploaded photo
                  </a>
                ) : null}
              </div>
            </Field>
            <Field
              id="ob-slip"
              label="Salary slips"
              className="sm:col-span-2"
            >
              <div className="space-y-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  {uploading === 'salarySlipUrls'
                    ? 'Uploading…'
                    : 'Upload salary slips (multiple)'}
                  <input
                    type="file"
                    accept={FILE_ACCEPT}
                    multiple
                    className="hidden"
                    disabled={!!uploading}
                    onChange={(e) => void handleSalarySlipUpload(e)}
                  />
                </label>
                <p className="text-xs text-slate-500">
                  PDF, JPG, PNG, DOC, and similar formats are accepted. You can select multiple
                  files.
                </p>
                {form.salarySlipUrls.length > 0 ? (
                  <ul className="space-y-2">
                    {form.salarySlipUrls.map((url, index) => (
                      <li
                        key={url}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-brand-600 underline"
                        >
                          Salary slip {index + 1}
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSalarySlip(url)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Field>
            <Field id="ob-relieving" label="Relieving letter" className="sm:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  {uploading === 'relievingLetterUrl'
                    ? 'Uploading…'
                    : 'Upload relieving letter'}
                  <input
                    type="file"
                    accept={FILE_ACCEPT}
                    className="hidden"
                    disabled={!!uploading}
                    onChange={(e) =>
                      void handleUploadSingle('relievingLetterUrl', e, 'relieving-letters')
                    }
                  />
                </label>
                {form.relievingLetterUrl ? (
                  <a
                    href={form.relievingLetterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm text-brand-600 underline"
                  >
                    View file
                  </a>
                ) : null}
              </div>
            </Field>
          </SectionCard>

          <SectionCard title="Permanent address">
            <Field id="ob-p-line1" label="Line 1" required className="sm:col-span-2">
              <Input
                id="ob-p-line1"
                value={form.permanentLine1}
                onChange={(e) => set('permanentLine1', e.target.value)}
              />
            </Field>
            <Field id="ob-p-line2" label="Line 2" className="sm:col-span-2">
              <Input
                id="ob-p-line2"
                value={form.permanentLine2}
                onChange={(e) => set('permanentLine2', e.target.value)}
              />
            </Field>
            <Field id="ob-p-city" label="City" required>
              <Input
                id="ob-p-city"
                value={form.permanentCity}
                onChange={(e) => set('permanentCity', e.target.value)}
              />
            </Field>
            <Field id="ob-p-state" label="State" required>
              <Input
                id="ob-p-state"
                value={form.permanentState}
                onChange={(e) => set('permanentState', e.target.value)}
              />
            </Field>
            <Field id="ob-p-pin" label="Pincode" required>
              <Input
                id="ob-p-pin"
                value={form.permanentPincode}
                onChange={(e) => set('permanentPincode', e.target.value)}
              />
            </Field>
            <Field id="ob-p-country" label="Country" required>
              <Input
                id="ob-p-country"
                value={form.permanentCountry}
                onChange={(e) => set('permanentCountry', e.target.value)}
              />
            </Field>
          </SectionCard>

          <SectionCard title="Current address">
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.sameAsPermanent}
                onChange={(e) => set('sameAsPermanent', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Same as permanent address
            </label>
            {!form.sameAsPermanent ? (
              <>
                <Field id="ob-c-line1" label="Line 1" required className="sm:col-span-2">
                  <Input
                    id="ob-c-line1"
                    value={form.currentLine1}
                    onChange={(e) => set('currentLine1', e.target.value)}
                  />
                </Field>
                <Field id="ob-c-line2" label="Line 2" className="sm:col-span-2">
                  <Input
                    id="ob-c-line2"
                    value={form.currentLine2}
                    onChange={(e) => set('currentLine2', e.target.value)}
                  />
                </Field>
                <Field id="ob-c-city" label="City" required>
                  <Input
                    id="ob-c-city"
                    value={form.currentCity}
                    onChange={(e) => set('currentCity', e.target.value)}
                  />
                </Field>
                <Field id="ob-c-state" label="State" required>
                  <Input
                    id="ob-c-state"
                    value={form.currentState}
                    onChange={(e) => set('currentState', e.target.value)}
                  />
                </Field>
                <Field id="ob-c-pin" label="Pincode" required>
                  <Input
                    id="ob-c-pin"
                    value={form.currentPincode}
                    onChange={(e) => set('currentPincode', e.target.value)}
                  />
                </Field>
                <Field id="ob-c-country" label="Country" required>
                  <Input
                    id="ob-c-country"
                    value={form.currentCountry}
                    onChange={(e) => set('currentCountry', e.target.value)}
                  />
                </Field>
              </>
            ) : null}
          </SectionCard>

          <SectionCard title="Bank details">
            <Field id="ob-holder" label="Account holder name" required className="sm:col-span-2">
              <Input
                id="ob-holder"
                value={form.accountHolderName}
                onChange={(e) => set('accountHolderName', e.target.value)}
              />
            </Field>
            <Field id="ob-acc" label="Account number" required>
              <Input
                id="ob-acc"
                value={form.accountNumber}
                onChange={(e) => set('accountNumber', e.target.value)}
              />
            </Field>
            <Field id="ob-ifsc" label="IFSC" required>
              <Input
                id="ob-ifsc"
                value={form.ifsc}
                onChange={(e) => set('ifsc', e.target.value.toUpperCase())}
                placeholder="AAAA0XXXXXX"
              />
            </Field>
            <Field id="ob-bank" label="Bank name" required>
              <Input
                id="ob-bank"
                value={form.bankName}
                onChange={(e) => set('bankName', e.target.value)}
              />
            </Field>
            <Field id="ob-branch" label="Branch">
              <Input
                id="ob-branch"
                value={form.branch}
                onChange={(e) => set('branch', e.target.value)}
              />
            </Field>
          </SectionCard>

          {errors.length > 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Onboarding id: <span className="font-mono">{onboardingId}</span>
            </p>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={submitState.isLoading || !!uploading}
            >
              {submitState.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit onboarding form
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default OrganisationOnboardingFormPage
