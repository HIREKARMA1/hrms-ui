/**
 * Display labels for bonus types and incentive kinds in Variable Pay UI.
 * Used by filters, tables, and add-entry dialogs.
 */

import type { BonusRunType, IncentiveType } from '../types/variablePay'

export const BONUS_RUN_TYPES: BonusRunType[] = [
  'Statutory',
  'Festival',
  'Performance',
  'Other',
]

export const INCENTIVE_TYPES: IncentiveType[] = [
  'Sales commission',
  'Target incentive',
  'Referral',
  'Other',
]

export const MOCK_SETTLEMENT_ACTOR = 'Rohith Goud'

export const SETTLEMENT_CA_NOTICE =
  'Confirm gratuity, bonus and settlement values with your CA or compliance advisor.'
