/**
 * Shared Tailwind class strings for payroll polish (tabs, filters, buttons, tables).
 * Import from here instead of duplicating payroll-specific UI tokens.
 */

export const PAYROLL_STICKY_TABS_OFFSET = 'top-16'

export const PAYROLL_PAGE_SCROLL_BG = 'bg-[#f4f6fb]'

export const PAYROLL_MOTION =
  'transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const PAYROLL_FILTER_INPUT =
  'h-10 max-w-[20rem] w-full rounded-xl border border-hrms-border bg-white pl-9 pr-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const PAYROLL_FILTER_SELECT =
  'h-10 min-w-[10rem] rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const PAYROLL_SECONDARY_BUTTON =
  'border-hrms-border bg-hrms-lavender text-hrms-primary hover:bg-hrms-lavender/80'

export const PAYROLL_TABLE_THEAD = 'bg-hrms-muted-bg text-hrms-text-secondary'

export const PAYROLL_TABLE_ROW =
  'border-b border-hrms-border/40 hover:bg-hrms-row-hover'

export const PAYROLL_CARD_TABLE_TITLE = 'text-base font-semibold text-hrms-navy'

export const PAYROLL_DIALOG_OVERLAY = 'fixed inset-0 z-50 bg-slate-950/50'

export const PAYROLL_DIALOG_CONTENT_BASE =
  'fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-hrms-border bg-white shadow-lg focus:outline-none'

export const PAYROLL_DIALOG_SIZE_SM = 'max-w-lg'
export const PAYROLL_DIALOG_SIZE_MD = 'max-w-2xl'

export const PAYROLL_DIALOG_FIELD_LABEL = 'text-sm font-medium text-hrms-navy'

/** Full-width selects inside payroll modals (matches filter row controls). */
export const PAYROLL_DIALOG_SELECT =
  'h-10 w-full rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'
