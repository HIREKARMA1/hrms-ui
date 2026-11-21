import { KeyRound } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ChangePasswordForm } from '../components/ChangePasswordForm'

export function ChangePasswordPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Change Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the password for your HRMS account.
        </p>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl bg-brand-50 p-2 text-brand-600">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Account security
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-500">
                Enter your current password, then choose a new one. Other signed-in devices will be
                signed out after a successful change.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangePasswordPage
