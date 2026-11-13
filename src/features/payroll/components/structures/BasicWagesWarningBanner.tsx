/**
 * Non-blocking warning when basic pay is below the labour code wage share.
 * Shown in StructureLivePreview while editing a salary structure.
 */

import { BASIC_MIN_SHARE_OF_GROSS } from '../../constants/labourCodeRules'

type BasicWagesWarningBannerProps = {
  basicAmount: number
  grossAmount: number
}

export function BasicWagesWarningBanner({
  basicAmount,
  grossAmount,
}: BasicWagesWarningBannerProps) {
  if (grossAmount <= 0) {
    return null
  }

  const share = Math.round((basicAmount / grossAmount) * 100)
  if (share >= BASIC_MIN_SHARE_OF_GROSS) {
    return null
  }

  return (
    <div
      className="rounded-xl border border-hrms-warning/40 bg-hrms-warning/10 px-3 py-2 text-xs text-hrms-warning"
      role="status"
    >
      Basic is {share}% of gross. Under the new labour codes, wages (basic and similar)
      should generally be at least {BASIC_MIN_SHARE_OF_GROSS}% of total pay. Confirm with
      your CA.
    </div>
  )
}
