import type { PipelineStage } from '../types/recruitment'

export const STAGE_BAR_FILL: Record<PipelineStage, string> = {
  Applied: '#94A3B8',
  Screening: '#0EA5E9',
  Shortlisted: '#8B5CF6',
  Interview: '#6366F1',
  Selected: '#10B981',
  'Offer Released': '#F59E0B',
  Joined: '#22C55E',
  Rejected: '#F43F5E',
}

export const PIPELINE_STAGE_STYLES: Record<
  PipelineStage,
  { badge: string; column: string; accent: string }
> = {
  Applied: {
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    column: 'border-t-slate-400',
    accent: 'bg-slate-100 text-slate-700',
  },
  Screening: {
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
    column: 'border-t-sky-500',
    accent: 'bg-sky-50 text-sky-800',
  },
  Shortlisted: {
    badge: 'border-violet-200 bg-violet-50 text-violet-800',
    column: 'border-t-violet-500',
    accent: 'bg-violet-50 text-violet-800',
  },
  Interview: {
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    column: 'border-t-indigo-500',
    accent: 'bg-indigo-50 text-indigo-800',
  },
  Selected: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    column: 'border-t-emerald-500',
    accent: 'bg-emerald-50 text-emerald-800',
  },
  'Offer Released': {
    badge: 'border-amber-200 bg-amber-50 text-amber-900',
    column: 'border-t-amber-500',
    accent: 'bg-amber-50 text-amber-900',
  },
  Joined: {
    badge: 'border-green-200 bg-green-50 text-green-800',
    column: 'border-t-green-500',
    accent: 'bg-green-50 text-green-800',
  },
  Rejected: {
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    column: 'border-t-rose-500',
    accent: 'bg-rose-50 text-rose-800',
  },
}