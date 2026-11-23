/**
 * Leave Settings left-nav section ids and copy for the two-pane layout.
 */

import {
  BadgeIndianRupee,
  CalendarRange,
  ClipboardList,
  GitBranch,
  History,
  Settings2,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type LeaveSettingsSectionId =
  | 'leave-types'
  | 'general'
  | 'approvals'
  | 'holidays'
  | 'encashment'
  | 'coverage'
  | 'history'

export type LeaveSettingsSectionMeta = {
  id: LeaveSettingsSectionId
  label: string
  description: string
  icon: LucideIcon
}

export const LEAVE_SETTINGS_SECTIONS: LeaveSettingsSectionMeta[] = [
  {
    id: 'leave-types',
    label: 'Leave types',
    description: 'What each kind of leave means and who approves it.',
    icon: ClipboardList,
  },
  {
    id: 'general',
    label: 'General',
    description: 'Leave year, weekly offs, and rules that apply to every type.',
    icon: Settings2,
  },
  {
    id: 'approvals',
    label: 'Approvals & escalation',
    description: 'How long approvers have before HR is notified.',
    icon: GitBranch,
  },
  { id: 'holidays', label: 'Holidays', description: 'Days the office is closed.', icon: CalendarRange },
  {
    id: 'encashment',
    label: 'Encashment',
    description: 'When unused leave can be paid out in cash.',
    icon: BadgeIndianRupee,
  },
  { id: 'coverage', label: 'Team coverage', description: 'How many people can be away on the same day.', icon: Users },
  { id: 'history', label: 'History', description: 'Saved changes to these settings.', icon: History },
]
