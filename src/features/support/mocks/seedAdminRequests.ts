import type { AdminSupportRequest } from '../types/adminSupportRequest'

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const SEED_ADMIN_SUPPORT_REQUESTS: AdminSupportRequest[] = [
  {
    id: 'REQ-1001',
    email: 'priya.sharma@example.com',
    employeeId: 'HK-2048',
    issues: ['password'],
    note: 'Reset link expired before I could use it.',
    status: 'open',
    createdAt: hoursAgo(26),
    replies: [],
  },
  {
    id: 'REQ-1002',
    email: 'amit.verma@example.com',
    employeeId: 'HK-1881',
    issues: ['employee_id', 'other'],
    otherDetail: 'Portal shows old ID after transfer to Bangalore office.',
    status: 'replied',
    createdAt: hoursAgo(72),
    replies: [
      {
        id: 'r-1',
        message:
          'Your employee ID has been updated to HK-1881-BLR in the system. Please sign out and sign in again. Contact us if you still see the old ID.',
        sentAt: hoursAgo(68),
        sentBy: 'HR Support',
      },
    ],
  },
]