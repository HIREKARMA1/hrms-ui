/**
 * Twelve ICs plus HR demo user matching payroll roster departments and names.
 * Imported by mockLeaveStore only; not coupled to features/payroll.
 */

import type { LeaveEmployee } from '../types/employee'
import { HR_DEMO_USER_ID, HR_DEMO_USER_NAME } from '../constants/leaveRules'

const roster: Omit<LeaveEmployee, 'managerId'>[] = [
  { id: 'EMP-1001', name: 'Ananya Sharma', department: 'Engineering', gender: 'Female', joiningDate: '2019-04-01', roleTitle: 'Engineering Manager' },
  { id: 'EMP-1002', name: 'Rahul Mehta', department: 'Product', gender: 'Male', joiningDate: '2020-07-15', roleTitle: 'Product Manager' },
  { id: 'EMP-1003', name: 'Priya Nair', department: 'HR', gender: 'Female', joiningDate: '2021-01-10' },
  { id: 'EMP-1004', name: 'Vikram Singh', department: 'Finance', gender: 'Male', joiningDate: '2018-11-20', roleTitle: 'Finance Manager' },
  { id: 'EMP-1005', name: 'Sneha Reddy', department: 'Sales & Marketing', gender: 'Female', joiningDate: '2022-03-05' },
  { id: 'EMP-1006', name: 'Arjun Das', department: 'Engineering', gender: 'Male', joiningDate: '2020-02-01' },
  { id: 'EMP-1007', name: 'Meera Iyer', department: 'Product', gender: 'Female', joiningDate: '2020-09-01' },
  { id: 'EMP-1008', name: 'Karan Patel', department: 'Finance', gender: 'Male', joiningDate: '2021-05-12' },
  { id: 'EMP-1009', name: 'Divya Rao', department: 'HR', gender: 'Female', joiningDate: '2019-08-18' },
  { id: 'EMP-1010', name: 'Nikhil Verma', department: 'Sales & Marketing', gender: 'Male', joiningDate: '2022-11-01' },
  { id: 'EMP-1011', name: 'Pooja Kulkarni', department: 'Engineering', gender: 'Female', joiningDate: '2017-02-14' },
  { id: 'EMP-1012', name: 'Aditya Ghosh', department: 'Product', gender: 'Male', joiningDate: '2021-10-01' },
]

function pickManager(department: string): string | null {
  if (department === 'Engineering') return 'EMP-1001'
  if (department === 'Product') return 'EMP-1002'
  if (department === 'Finance') return 'EMP-1004'
  return HR_DEMO_USER_ID
}

export function buildMockEmployees(): LeaveEmployee[] {
  const people: LeaveEmployee[] = roster.map((item) => ({
    ...item,
    managerId: item.roleTitle?.includes('Manager') ? HR_DEMO_USER_ID : pickManager(item.department),
  }))
  people.push({
    id: HR_DEMO_USER_ID,
    name: HR_DEMO_USER_NAME,
    department: 'HR',
    gender: 'Male',
    joiningDate: '2016-06-01',
    managerId: null,
    roleTitle: 'HR Manager',
  })
  return people
}
