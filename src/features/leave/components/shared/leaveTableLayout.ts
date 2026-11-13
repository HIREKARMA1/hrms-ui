/**
 * Table cell and header width helpers for leave data grids.
 * Keeps numeric and date columns aligned across My Leave and Approvals.
 */

export const LEAVE_TABLE_BASE = 'w-full table-fixed text-left text-sm'

export const leaveThClass = (align: 'left' | 'right' = 'left', width?: string) =>
  `px-4 py-3 text-xs font-semibold whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'} ${width ?? ''}`

export const leaveTdClass = (align: 'left' | 'right' = 'left', extra?: string) =>
  `px-4 py-3 align-middle whitespace-nowrap ${align === 'right' ? 'text-right tabular-nums' : 'font-medium'} ${extra ?? ''}`
