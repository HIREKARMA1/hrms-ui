import { describe, expect, it } from 'vitest'

import { buildPaginationItems } from './table-pagination.utils'

describe('buildPaginationItems', () => {
  it('lists every page when total is small', () => {
    expect(buildPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('lists every page up to the no-ellipsis threshold', () => {
    expect(buildPaginationItems(1, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('inserts ellipsis for large page counts with a wider window', () => {
    expect(buildPaginationItems(1, 20)).toEqual([1, 2, 3, 'ellipsis', 20])
    expect(buildPaginationItems(10, 20)).toEqual([
      1,
      'ellipsis',
      8,
      9,
      10,
      11,
      12,
      'ellipsis',
      20,
    ])
    expect(buildPaginationItems(20, 20)).toEqual([1, 'ellipsis', 18, 19, 20])
  })

  it('matches the middle-page window from the product UI', () => {
    expect(buildPaginationItems(6, 12)).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      7,
      8,
      'ellipsis',
      12,
    ])
  })
})
