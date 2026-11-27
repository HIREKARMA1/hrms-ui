/** Shared Tailwind tokens for Recruitment & ATS (Premium Teal & Navy). */

import {
  APP_CARD,
  APP_CARD_HEADER,
  APP_FILTER_BAR,
  APP_PAGE_SHELL,
  APP_TABLE_WRAP,
} from '@/components/design/appUi'

export const RECRUITMENT_PAGE_SHELL = 'w-full bg-app-bg min-h-full'
export const RECRUITMENT_PAGE_INNER = `${APP_PAGE_SHELL} px-1 pt-1 sm:px-0`

export const RECRUITMENT_CARD = APP_CARD

export const RECRUITMENT_CARD_HEADER = APP_CARD_HEADER

export const RECRUITMENT_FILTER_BAR = APP_FILTER_BAR

export const RECRUITMENT_TABLE_SHELL = APP_TABLE_WRAP

export const RECRUITMENT_TABLE_HEAD =
  'border-b border-border-soft bg-[#FAFBFD] text-text-secondary'

export const RECRUITMENT_ACTIVE_SECTION_PILL =
  'rounded-lg border border-border-soft bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-sm'

export const RECRUITMENT_DEMO_PILL =
  'inline-flex max-w-full items-center gap-2 rounded-full border border-border-soft bg-white px-3 py-1.5 text-[12px] text-text-secondary shadow-sm'

export const RECRUITMENT_INFO_NOTE =
  'rounded-xl border border-border-soft bg-white/80 px-4 py-2.5 text-sm text-text-secondary'
