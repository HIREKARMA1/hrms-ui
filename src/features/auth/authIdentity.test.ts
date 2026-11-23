/**
 * Stage 4.6.1: one display identity (the Redux auth user) across the app
 * header, Leave Management and Payroll. Components are server-rendered with
 * the real providers; no network is involved.
 */
import { configureStore } from '@reduxjs/toolkit'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { Header } from '@/components/layout/Header'
import headerSource from '@/components/layout/Header.tsx?raw'
import { LayoutProvider } from '@/components/layout/LayoutContext'
import { LeavePageHeader } from '@/features/leave/components/LeavePageHeader'
import { LEAVE_DEMO_VIEWERS } from '@/features/leave/constants/leaveDemoViewers'
import { LeaveViewerProvider } from '@/features/leave/context/LeaveViewerProvider'
import leaveViewerProviderSource from '@/features/leave/context/LeaveViewerProvider.tsx?raw'
import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'
import { resolveLeaveViewer } from '@/features/leave/utils/resolveLeaveViewer'
import { PayrollPageHeader } from '@/features/payroll/components/PayrollPageHeader'
import { PayrollToastProvider } from '@/features/payroll/components/PayrollToastProvider'
import { PayrollProvider } from '@/features/payroll/context/PayrollProvider'
import { RbacProvider } from '@/features/rbac/context/RbacProvider'
import rbacMocksSource from '@/features/rbac/mocks/rbacMocks.ts?raw'
import type { BackendRoleCode } from '@/features/rbac/types/roles'
import { baseApi } from '@/services/api/baseApi'

import { authReducer } from './store/authSlice'
import type { AuthUser } from './types/auth.types'
import { getUserDisplayName, getUserInitials } from './utils/authUser'

const MULTI_ROLE_USER: AuthUser = {
  id: 'user-42',
  email: 'priya.sharma@example.test',
  role: 'HR_ADMIN',
  roles: ['EMPLOYEE', 'HR_ADMIN'],
  permissions: ['employees:read', 'leave_requests:create'],
  isActive: true,
}

const DEMO_NAMES = Object.values(LEAVE_DEMO_VIEWERS).map((viewer) => viewer.displayName)
  .concat(['Rohith Goud', 'Ananya Sharma', 'Arjun Das'])

function makeStore(user: AuthUser | null) {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: {
        accessToken: user ? 'test-access' : null,
        refreshToken: user ? 'test-refresh' : null,
        user,
        rememberMe: false,
      },
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })
}

function render(user: AuthUser | null, workspace: BackendRoleCode | null, child: ReactNode) {
  const inner = workspace
    ? createElement(RbacProvider, { roleCode: workspace, children: child })
    : child
  return renderToStaticMarkup(
    createElement(Provider, {
      store: makeStore(user),
      children: createElement(MemoryRouter, null, createElement(LayoutProvider, { children: inner })),
    }),
  )
}

function LeaveHeaderFromContext() {
  const { viewer, role, setViewerRole } = useLeaveViewer()
  return createElement(LeavePageHeader, { viewer, role, onRoleChange: setViewerRole })
}

function PayrollHeaderFromContext() {
  const { viewer, role, setViewerRole } = useLeaveViewer()
  return createElement(PayrollPageHeader, { viewer, role, onRoleChange: setViewerRole })
}

const leaveHeader = () =>
  createElement(LeaveViewerProvider, null, createElement(LeaveHeaderFromContext))

const payrollHeader = () =>
  createElement(
    LeaveViewerProvider,
    null,
    createElement(
      PayrollToastProvider,
      null,
      createElement(PayrollProvider, null, createElement(PayrollHeaderFromContext)),
    ),
  )

function expectNoDemoPersona(html: string) {
  for (const name of DEMO_NAMES) expect(html).not.toContain(name)
  expect(html).not.toContain('leave-demo-view')
}

describe('display identity', () => {
  it('uses the email when the backend supplies no display name', () => {
    expect(getUserDisplayName(MULTI_ROLE_USER)).toBe('priya.sharma@example.test')
    expect(getUserInitials(MULTI_ROLE_USER)).toBe('PS')
    expect(getUserInitials({ email: 'admin@example.test' })).toBe('A')
  })

  it('1. the app header shows the Redux user', () => {
    const html = render(MULTI_ROLE_USER, 'HR_ADMIN', createElement(Header))
    expect(html).toContain('priya.sharma@example.test')
    expect(html).toContain('PS')
    expectNoDemoPersona(html)
  })

  it('2. the Leave header shows the same identity', () => {
    const html = render(MULTI_ROLE_USER, 'HR_ADMIN', leaveHeader())
    expect(html).toContain('Signed in as')
    expect(html).toContain('priya.sharma@example.test')
    expectNoDemoPersona(html)
  })

  it('3. the Payroll header shows the same identity', () => {
    const html = render(MULTI_ROLE_USER, 'HR_ADMIN', payrollHeader())
    expect(html).toContain('Signed in as')
    expect(html).toContain('priya.sharma@example.test')
    expectNoDemoPersona(html)
  })

  it('header, Leave and Payroll agree on one name', () => {
    const name = getUserDisplayName(MULTI_ROLE_USER)
    for (const child of [createElement(Header), leaveHeader(), payrollHeader()]) {
      expect(render(MULTI_ROLE_USER, 'EMPLOYEE', child)).toContain(name)
    }
  })
})

describe('demo personas', () => {
  it('4. are never used for an authenticated user, whatever the workspace', () => {
    for (const workspace of ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] as const) {
      const viewer = resolveLeaveViewer({ user: MULTI_ROLE_USER, workspaceRole: workspace, demoRole: 'HR_ADMIN' })
      expect(viewer).toEqual({
        role: workspace,
        employeeId: null,
        actorId: 'user-42',
        displayName: 'priya.sharma@example.test',
        email: 'priya.sharma@example.test',
        source: 'authenticated',
      })
    }
  })

  it('are only used when nobody is signed in', () => {
    const viewer = resolveLeaveViewer({ user: null, workspaceRole: null, demoRole: 'EMPLOYEE' })
    expect(viewer.source).toBe('demo')
    expect(viewer.displayName).toBe('Arjun Das')

    const html = render(null, null, leaveHeader())
    expect(html).toContain('Demo view as')
    expect(html).toContain('leave-demo-view')
  })

  it('no authenticated component reads the old mock identities', () => {
    expect(rbacMocksSource).not.toContain('mockSessionsByRole')
    expect(headerSource).not.toMatch(/rbacMocks|LEAVE_DEMO_VIEWERS|mockSessions/)
    expect(leaveViewerProviderSource).not.toContain('LEAVE_DEMO_VIEWERS')
    expect(leaveViewerProviderSource).toContain('useAuthenticatedUser')
  })
})

describe('11. multi-role user', () => {
  it('keeps one identity while the workspace only changes the role shown', () => {
    const asEmployee = render(MULTI_ROLE_USER, 'EMPLOYEE', leaveHeader())
    const asHr = render(MULTI_ROLE_USER, 'HR_ADMIN', leaveHeader())
    for (const html of [asEmployee, asHr]) {
      expect(html).toContain('priya.sharma@example.test')
      expectNoDemoPersona(html)
    }
    expect(asEmployee).toContain('Employee')
    expect(asHr).toContain('HR Admin')
  })

  it('without a workspace falls back to the least-privileged UI role', () => {
    const viewer = resolveLeaveViewer({ user: MULTI_ROLE_USER, workspaceRole: null, demoRole: 'SUPER_ADMIN' })
    expect(viewer.role).toBe('EMPLOYEE')
    expect(viewer.source).toBe('authenticated')
  })
})
