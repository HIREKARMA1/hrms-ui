/**
 * Shared Premium Teal & Navy application design tokens and layout classes.
 * Prefer these over one-off hex values so every workspace stays consistent.
 */

export const APP_COLORS = {
  navy: '#17213A',
  primary: '#0F766E',
  primaryHover: '#115E59',
  lightTeal: '#14B8A6',
  softTeal: '#CCFBF1',
  white: '#FFFFFF',
  page: '#F7F8FC',
  muted: '#EEF0F6',
  textPrimary: '#17213A',
  textSecondary: '#667085',
  border: '#E2E6EF',
  focus: '#14B8A6',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
} as const

export const APP_CHART_COLORS = [
  APP_COLORS.primary,
  APP_COLORS.lightTeal,
  APP_COLORS.navy,
  '#5EEAD4',
  '#0D9488',
  '#99F6E4',
] as const

/** Standard authenticated page content column. */
export const APP_PAGE_SHELL =
  'mx-auto flex w-full max-w-[1400px] flex-col gap-5 pb-8 sm:gap-6'

export const APP_PAGE_TITLE = 'text-2xl font-bold tracking-tight text-navy'

export const APP_PAGE_SUBTITLE = 'mt-1 text-sm text-text-secondary'

export const APP_SECTION_TITLE = 'text-base font-semibold text-navy'

export const APP_SECTION_DESC = 'text-sm text-text-secondary'

/** Primary content card used across tables, forms, and panels. */
export const APP_CARD =
  'overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_1px_2px_rgba(23,33,58,0.04)]'

export const APP_CARD_HEADER =
  'border-b border-border-soft bg-[#FAFBFD] px-5 py-4'

export const APP_CARD_BODY = 'p-5'

export const APP_FILTER_BAR =
  'flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-[0_1px_2px_rgba(23,33,58,0.04)] sm:flex-row sm:flex-wrap sm:items-center'

export const APP_TABLE_WRAP =
  'overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_1px_2px_rgba(23,33,58,0.04)]'

export const APP_EMPTY =
  'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-soft bg-white px-6 py-12 text-center'

export const APP_BANNER_INFO =
  'rounded-xl border border-teal-soft bg-[#F0FDFA] px-4 py-3 text-sm text-teal'

export const APP_BANNER_WARN =
  'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'

export const APP_BANNER_ERROR =
  'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'

export const APP_BANNER_SUCCESS =
  'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900'

export const APP_CHART_TOOLTIP = {
  borderRadius: 12,
  border: `1px solid ${APP_COLORS.border}`,
  background: APP_COLORS.white,
} as const
