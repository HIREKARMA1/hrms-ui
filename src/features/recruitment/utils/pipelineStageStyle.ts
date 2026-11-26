import type { ApplicationStatus } from '../api/applicationsApi.types'

export const STAGE_BAR_FILL: Record<ApplicationStatus, string> = {
  APPLIED: '#94A3B8',
  SCREENING: '#0EA5E9',
  SHORTLISTED: '#8B5CF6',
  INTERVIEW: '#6366F1',
  SELECTED: '#10B981',
  OFFER_RELEASED: '#F59E0B',
  JOINED: '#22C55E',
  REJECTED: '#F43F5E',
  WITHDRAWN: '#94A3B8',
}

export const PIPELINE_STAGE_STYLES: Record<
  ApplicationStatus,
  { badge: string; column: string; accent: string }
> = {
  APPLIED: {
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    column: 'border-t-slate-400',
    accent: 'bg-slate-100 text-slate-700',
  },
  SCREENING: {
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
    column: 'border-t-sky-500',
    accent: 'bg-sky-50 text-sky-800',
  },
  SHORTLISTED: {
    badge: 'border-violet-200 bg-violet-50 text-violet-800',
    column: 'border-t-violet-500',
    accent: 'bg-violet-50 text-violet-800',
  },
  INTERVIEW: {
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    column: 'border-t-indigo-500',
    accent: 'bg-indigo-50 text-indigo-800',
  },
  SELECTED: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    column: 'border-t-emerald-500',
    accent: 'bg-emerald-50 text-emerald-800',
  },
  OFFER_RELEASED: {
    badge: 'border-amber-200 bg-amber-50 text-amber-900',
    column: 'border-t-amber-500',
    accent: 'bg-amber-50 text-amber-900',
  },
  JOINED: {
    badge: 'border-green-200 bg-green-50 text-green-800',
    column: 'border-t-green-500',
    accent: 'bg-green-50 text-green-800',
  },
  REJECTED: {
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    column: 'border-t-rose-500',
    accent: 'bg-rose-50 text-rose-800',
  },
  WITHDRAWN: {
    badge: 'border-gray-200 bg-gray-50 text-gray-700',
    column: 'border-t-gray-400',
    accent: 'bg-gray-100 text-gray-700',
  },
}