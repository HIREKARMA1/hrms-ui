/**
 * Human-readable label for YYYY-MM payroll month from context.
 * Re-exports formatMonth for older call sites in the payroll feature.
 */

export { formatMonth as formatPayrollMonthLabel, formatMonth } from './formatMonth'
