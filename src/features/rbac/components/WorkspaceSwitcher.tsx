import { ArrowLeftRight, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'

import { useOptionalRbacSession } from '../hooks/useRbacSession'
import type { BackendRoleCode } from '../types/roles'
import { canSwitchWorkspaces, getAvailableWorkspaces } from '../utils/workspaces'

/**
 * Header control for users who hold more than one role. Lists only workspaces
 * for roles on the authenticated user (Redux); renders nothing otherwise.
 * Selecting a workspace only navigates - RoleLayout still authorizes it.
 */
export function WorkspaceSwitcher() {
  const { user } = useAuthenticatedUser()
  const rbac = useOptionalRbacSession()
  const navigate = useNavigate()

  if (!user) return null

  const workspaces = getAvailableWorkspaces(user, rbac?.roleCode ?? null)
  if (!canSwitchWorkspaces(workspaces)) return null

  const current = workspaces.find((item) => item.isCurrent)

  function handleSelect(value: string) {
    const target = workspaces.find((item) => item.roleCode === (value as BackendRoleCode))
    // Closing the menu or re-selecting the current workspace changes nothing.
    if (!target || target.isCurrent) return
    navigate(target.route)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch workspace"
          className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none sm:px-3"
        >
          <ArrowLeftRight className="h-4 w-4 text-slate-500" aria-hidden />
          <span className="hidden sm:inline">{current?.label ?? 'Workspace'}</span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={current?.roleCode ?? ''} onValueChange={handleSelect}>
          {workspaces.map((item) => (
            <DropdownMenuRadioItem key={item.roleCode} value={item.roleCode}>
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
