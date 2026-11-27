import { describe, expect, it } from 'vitest'

import { formatDeviceClockTime } from './formatDeviceClockTime'

describe('formatDeviceClockTime', () => {
  it('formats HH:mm:ss to HH:mm', () => {
    expect(formatDeviceClockTime('10:18:50')).toBe('10:18')
  })

  it('keeps HH:mm', () => {
    expect(formatDeviceClockTime('09:52')).toBe('09:52')
  })

  it('returns em dash when missing', () => {
    expect(formatDeviceClockTime(null)).toBe('—')
    expect(formatDeviceClockTime('')).toBe('—')
  })
})