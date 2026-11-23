import { LoginBranding } from '../components/LoginBranding'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh w-full overflow-x-hidden bg-[#f5f6fb]">
      <LoginBranding />

      <section className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
        <div className="mb-8 text-center lg:hidden">
          <p className="text-2xl font-bold tracking-tight text-brand-600">HRMS</p>
          <p className="mt-1 text-sm text-slate-500">
            Human Resources Management System
          </p>
        </div>
        <ResetPasswordForm />
      </section>
    </main>
  )
}

export default ResetPasswordPage
