import { useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getUserErrorMessage,
  useCreateUserMutation,
} from '@/features/users/api/usersApi'

import { EmployeeNotice } from './EmployeeNotice'

type CreateEmployeeLoginPanelProps = {
  employeeId: string
  defaultEmail: string
  employeeLabel?: string
  onCreated?: () => void
  onSkip?: () => void
}

/**
 * POST /users after an employee is onboarded. Email is usually the employee work email;
 * the server derives the RBAC role from Employee.role.
 */
export function CreateEmployeeLoginPanel({
  employeeId,
  defaultEmail,
  employeeLabel,
  onCreated,
  onSkip,
}: CreateEmployeeLoginPanelProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [createUser, createState] = useCreateUserMutation()

  const submit = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setNotice({ tone: 'error', text: 'Email is required.' })
      return
    }
    if (password.length < 8) {
      setNotice({ tone: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirm) {
      setNotice({ tone: 'error', text: 'Password and confirmation do not match.' })
      return
    }
    setNotice(null)
    try {
      await createUser({
        email: trimmedEmail,
        password,
        employeeId,
      }).unwrap()
      setNotice({
        tone: 'success',
        text: `Login created for ${trimmedEmail}. They can sign in with this email and password.`,
      })
      setPassword('')
      setConfirm('')
      onCreated?.()
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getUserErrorMessage(error, 'Could not create the login account.'),
      })
    }
  }

  return (
    <Feature name="employee.createLogin">
      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Create login account</CardTitle>
          <CardDescription>
            {employeeLabel
              ? `Set an email and password so ${employeeLabel} can sign in to HRMS.`
              : 'Set an email and password so this employee can sign in to HRMS.'}{' '}
            The app role comes from the employee record (not chosen here).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notice ? (
            <EmployeeNotice tone={notice.tone}>{notice.text}</EmployeeNotice>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="login-email">Login email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                autoComplete="off"
                disabled={createState.isLoading || notice?.tone === 'success'}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                autoComplete="new-password"
                disabled={createState.isLoading || notice?.tone === 'success'}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-confirm">Confirm password</Label>
              <Input
                id="login-confirm"
                type="password"
                value={confirm}
                autoComplete="new-password"
                disabled={createState.isLoading || notice?.tone === 'success'}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={createState.isLoading || notice?.tone === 'success'}
              onClick={() => void submit()}
            >
              {createState.isLoading ? 'Creating…' : 'Create login'}
            </Button>
            {onSkip && notice?.tone !== 'success' ? (
              <Button
                type="button"
                variant="outline"
                disabled={createState.isLoading}
                onClick={onSkip}
              >
                Skip for now
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Feature>
  )
}
