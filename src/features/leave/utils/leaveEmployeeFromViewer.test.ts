import { describe, expect, it } from 'vitest'

import type { LeaveEmployee } from '../types/employee'
import type { LinkedLeaveViewer } from '../types/viewer'
import { leaveEmployeeFromViewer, resolveMyLeaveEmployee } from './leaveEmployeeFromViewer'

const viewer: LinkedLeaveViewer = {
  role: 'EMPLOYEE',
  employeeId: 'emp-linked-1',
  actorId: 'user-1',
  displayName: 'Evan Employee',
  email: 'employee@hirekarma.in',
  source: 'authenticated',
}

describe('leaveEmployeeFromViewer', () => {
  it('builds a minimal employee from the linked viewer', () => {
    expect(leaveEmployeeFromViewer(viewer)).toEqual({
      id: 'emp-linked-1',
      name: 'Evan Employee',
      department: '',
      gender: 'Other',
      joiningDate: '',
      managerId: null,
      employmentStatus: 'ACTIVE',
    })
  })
})

describe('resolveMyLeaveEmployee', () => {
  it('prefers a matching snapshot employee over the viewer stub', () => {
    const listed: LeaveEmployee = {
      id: 'emp-linked-1',
      name: 'Directory Name',
      department: 'Engineering',
      gender: 'Other',
      joiningDate: '2024-01-15',
      managerId: null,
      employmentStatus: 'ACTIVE',
    }
    expect(resolveMyLeaveEmployee([listed], viewer)).toBe(listed)
  })

  it('falls back to the viewer when the snapshot has no match', () => {
    expect(resolveMyLeaveEmployee([], viewer).id).toBe('emp-linked-1')
    expect(resolveMyLeaveEmployee(undefined, viewer).name).toBe('Evan Employee')
  })
})
