import { describe, expect, it } from 'vitest'

import type { BackendUser } from '../api/usersApi.types'
import { USER_NAME_NOT_PROVIDED, formatUserDisplayName } from './userDisplayName'

function makeUser(
  employee: BackendUser['employee'],
): Pick<BackendUser, 'employee'> {
  return { employee }
}

describe('formatUserDisplayName', () => {
  it('combines firstName and lastName from the API employee summary', () => {
    expect(
      formatUserDisplayName(
        makeUser({
          id: 'e1',
          employeeCode: 'HK-1',
          firstName: 'Asha',
          lastName: 'Rao',
          email: 'asha@example.test',
        }),
      ),
    ).toBe('Asha Rao')
  })

  it('trims whitespace and drops empty parts', () => {
    expect(
      formatUserDisplayName(
        makeUser({
          id: 'e2',
          employeeCode: 'HK-2',
          firstName: '  Priya  ',
          lastName: '',
          email: 'priya@example.test',
        }),
      ),
    ).toBe('Priya')
  })

  it('returns a placeholder when employee is null or name parts are blank', () => {
    expect(formatUserDisplayName(makeUser(null))).toBe(USER_NAME_NOT_PROVIDED)
    expect(
      formatUserDisplayName(
        makeUser({
          id: 'e3',
          employeeCode: 'HK-3',
          firstName: '   ',
          lastName: '  ',
          email: 'blank@example.test',
        }),
      ),
    ).toBe(USER_NAME_NOT_PROVIDED)
  })

  it('does not fall back to email', () => {
    const name = formatUserDisplayName(makeUser(null))
    expect(name).not.toContain('@')
    expect(name).toBe(USER_NAME_NOT_PROVIDED)
  })
})
