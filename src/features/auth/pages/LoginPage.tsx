import { Navigate, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'

import { HrmsBrandLockup } from '../components/HrmsBrandLockup'
import { LoginBranding } from '../components/LoginBranding'
import { LoginForm } from '../components/LoginForm'
import { selectCurrentUser } from '../store/authSlice'
import { normalizeAuthUser } from '../utils/authUser'
import { getLandingRouteForUserRole } from '../utils/landingRoute'
import { getSafeReturnPath } from '../utils/returnPath'

export function LoginPage() {
  const location = useLocation()
  const user = useAppSelector(selectCurrentUser)
  const landing = user ? getLandingRouteForUserRole(user.role, user.roles) : null

  if (landing) {
    const returnTo = getSafeReturnPath(location.state, normalizeAuthUser(user))
    return <Navigate to={returnTo ?? landing} replace />
  }

  return (
    <main className="relative flex min-h-svh w-full overflow-x-hidden bg-[#F7F8FC]">
      <LoginBranding />

      <section className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:w-[52%] lg:px-10 xl:w-[54%]">
        {/* Soft teal decorative curves (right panel) */}
        <div
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#14B8A6]/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-[#CCFBF1]/80 blur-3xl"
          aria-hidden="true"
        />
        <svg
          className="pointer-events-none absolute top-0 right-0 h-[42%] w-[55%] text-[#14B8A6]/25"
          viewBox="0 0 400 360"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M400 0H160c40 70 120 110 160 180 30 55 50 110 80 180V0z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="pointer-events-none absolute right-0 bottom-0 h-[38%] w-[60%] text-[#0F766E]/12"
          viewBox="0 0 420 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M420 300H80c70-60 140-100 200-170C340 70 380 30 420 0v300z"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 mb-8 w-full max-w-[440px] lg:hidden">
          <HrmsBrandLockup />
        </div>

        <div className="relative z-10 w-full flex justify-center">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}

export default LoginPage
