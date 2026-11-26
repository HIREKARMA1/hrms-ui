import { describe, expect, it } from 'vitest'



import { formatEncashmentSubmitError } from './formatEncashmentSubmitError'



describe('formatEncashmentSubmitError', () => {

  it('maps missing policy errors', () => {

    const raw =

      'No active encashment policy for this leave type. Configure LeaveEncashmentPolicy (ratePerDay) before submitting requests. Employee salary/payroll fields are not available in the schema.'

    expect(formatEncashmentSubmitError(raw)).toMatch(/not open for encashment/i)

    expect(formatEncashmentSubmitError(raw)).not.toMatch(/ratePerDay/)

  })



  it('maps balance errors', () => {

    expect(formatEncashmentSubmitError('Not enough balance for encashment.')).toMatch(/not have enough leave balance/i)

  })



  it('falls back for empty input', () => {

    expect(formatEncashmentSubmitError('')).toMatch(/could not submit/i)

  })

})
