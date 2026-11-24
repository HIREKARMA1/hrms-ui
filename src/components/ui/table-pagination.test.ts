import { describe, expect, it } from 'vitest'

import { buildPaginationItems } from './table-pagination.utils'

describe('buildPaginationItems', () => {
  it('lists every page when total is small', () => {
    expect(buildPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('inserts ellipsis for large page counts', () => {
    expect(buildPaginationItems(1, 20)).toEqual([1, 2, 'ellipsis', 20])
    expect(buildPaginationItems(10, 20)).toEqual([
      1,
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
      20,
    ])
    expect(buildPaginationItems(20, 20)).toEqual([1, 'ellipsis', 19, 20])
  })
})
