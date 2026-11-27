import { KeyRound } from 'lucide-react'

import { AppPageHeader } from '@/components/design/AppPageHeader'
import { APP_PAGE_SHELL } from '@/components/design/appUi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ChangePasswordForm } from '../components/ChangePasswordForm'

export function ChangePasswordPage() {
  return (
    <div className={`${APP_PAGE_SHELL} max-w-xl`}>
      <AppPageHeader
        title="Change Password"
        description="Update the password for your HRMS account."
      />

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl bg-teal-soft p-2 text-teal">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <CardTitle>Account security</CardTitle>
              <CardDescription className="mt-1">
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
