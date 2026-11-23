/**
 * Shared Tailwind tokens for leave polish (tabs, filters, tables, sheets).
 * Import from here instead of duplicating leave-specific UI classes.
 */

/** Sticky tab row offset inside MainLayout main scrollport (not below the app header). */
export const LEAVE_STICKY_TABS_TOP = 'top-0'

export const LEAVE_PAGE_CHROME_BG = 'bg-app-bg'

export const LEAVE_MOTION =
  'transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const LEAVE_FILTER_INPUT =
  'h-10 max-w-[20rem] w-full rounded-xl border border-hrms-border bg-white pl-9 pr-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const LEAVE_FILTER_SELECT =
  'h-10 min-w-[10rem] rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const LEAVE_SECONDARY_BUTTON =
  'border-hrms-border bg-hrms-lavender text-hrms-primary hover:bg-hrms-lavender/80'

export const LEAVE_TABLE_THEAD = 'bg-hrms-muted-bg text-hrms-text-secondary'

export const LEAVE_TABLE_ROW =
  'border-b border-hrms-border/40 hover:bg-hrms-row-hover cursor-pointer'

export const LEAVE_CARD_TABLE_TITLE = 'text-base font-semibold text-hrms-navy'

export const LEAVE_FIELD_LABEL = 'text-sm font-medium text-hrms-navy'

export const LEAVE_DIALOG_SELECT =
  'h-10 w-full rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

/** @deprecated Use LEAVE_DIALOG_SELECT */
export const LEAVE_SHEET_SELECT = LEAVE_DIALOG_SELECT

export const LEAVE_DIALOG_OVERLAY =
  'fixed inset-0 z-50 bg-slate-950/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none'

export const LEAVE_DIALOG_MOTION =
  'data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 motion-reduce:animate-none motion-reduce:duration-0'

export const LEAVE_DIALOG_CONTENT_BASE =
  'fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-hrms-border bg-white shadow-lg focus:outline-none'

export const LEAVE_DIALOG_SIZE_SM = 'max-w-md'
export const LEAVE_DIALOG_SIZE_MD = 'max-w-xl'
export const LEAVE_DIALOG_SIZE_LG = 'max-w-3xl'
export const LEAVE_DIALOG_SIZE_XL = 'max-w-5xl'

export const LEAVE_DIALOG_TEXTAREA =
  'min-h-[4.5rem] w-full rounded-xl border border-hrms-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export const LEAVE_DIALOG_INPUT =
  'h-10 w-full rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

/** Number inputs in Leave Settings: hide spinners so unit suffixes stay readable. */
export const LEAVE_SETTINGS_NUMBER_INPUT =
  'h-10 w-full rounded-xl border border-hrms-border bg-white px-3 pr-14 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

export const LEAVE_SETTINGS_GROUP_ACCENT =
  'border-l-[3px] border-hrms-primary pl-4'

export const LEAVE_INFO_BANNER =
  'rounded-xl border border-hrms-info/20 bg-hrms-info/5 px-4 py-3 text-sm text-hrms-navy'
