/**
 * Seed leads for Admin Leads Management demo.
 */

import type { Lead } from '../types/lead'
import { mockLeadsExtra } from './mockLeadsExtra'

const now = '2026-11-10T10:00:00.000Z'

export const mockLeadsSeed: Lead[] = [
  {
    id: 'LD-2026-00001',
    leadName: 'CloudStack HRMS roll-out',
    companyName: 'Nova Manufacturing Pvt Ltd',
    contactPerson: 'Kavitha Menon',
    email: 'kavitha@novamfg.in',
    phone: '+91 98765 43210',
    website: 'https://novamfg.in',
    industry: 'Manufacturing',
    companySize: '201–500',
    source: 'Referral',
    category: 'Enterprise',
    priority: 'High',
    status: 'Qualified',
    assignedEmployeeId: 'EMP-1005',
    assignedEmployeeName: 'Sneha Reddy',
    description: 'Evaluating HRMS for 350 employees across 2 plants.',
    requirements: 'Attendance, payroll, leave, onboarding by Q1.',
    notes: [
      {
        id: 'LN-1',
        text: 'CFO wants compliance dashboard before demo.',
        authorName: 'Sneha Reddy',
        createdAt: '2026-11-08T09:00:00.000Z',
      },
    ],
    activities: [
      {
        id: 'LA-1',
        type: 'created',
        summary: 'Lead created',
        createdAt: now,
        createdBy: 'Sneha Reddy',
      },
      {
        id: 'LA-2',
        type: 'status',
        summary: 'Status changed to Qualified',
        createdAt: '2026-11-09T11:00:00.000Z',
        createdBy: 'Sneha Reddy',
      },
    ],
    attachments: [
      {
        id: 'LAT-1',
        fileName: 'Nova-RFP-outline.pdf',
        uploadedAt: '2026-11-08T14:00:00.000Z',
        uploadedBy: 'Sneha Reddy',
      },
    ],
    createdAt: now,
    updatedAt: '2026-11-09T11:00:00.000Z',
  },
  {
    id: 'LD-2026-00002',
    leadName: 'Payroll outsourcing pilot',
    companyName: 'Brightpath Retail',
    contactPerson: 'Imran Qureshi',
    email: 'imran@brightpath.io',
    phone: '+91 99887 76655',
    website: 'https://brightpath.io',
    industry: 'Retail',
    companySize: '51–200',
    source: 'Website',
    category: 'SMB',
    priority: 'Medium',
    status: 'Contacted',
    assignedEmployeeId: 'EMP-1002',
    assignedEmployeeName: 'Rahul Mehta',
    description: 'Needs payroll + statutory for 80 store staff.',
    requirements: 'Multi-location PT, PF reports.',
    notes: [],
    activities: [
      {
        id: 'LA-3',
        type: 'created',
        summary: 'Lead created',
        createdAt: '2026-11-05T08:00:00.000Z',
        createdBy: 'Priya Nair',
      },
    ],
    attachments: [],
    createdAt: '2026-11-05T08:00:00.000Z',
    updatedAt: '2026-11-05T08:00:00.000Z',
  },
  {
    id: 'LD-2026-00003',
    leadName: 'Campus hiring module',
    companyName: 'EduLeap Technologies',
    contactPerson: 'Sanjay Verma',
    email: 'sanjay@eduleap.com',
    phone: '+91 91234 56789',
    website: 'https://eduleap.com',
    industry: 'Education',
    companySize: '11–50',
    source: 'LinkedIn',
    category: 'Startup',
    priority: 'Low',
    status: 'New',
    assignedEmployeeId: 'EMP-1006',
    assignedEmployeeName: 'Arjun Das',
    description: 'Wants recruitment + onboarding for interns.',
    requirements: 'Budget-sensitive; monthly billing.',
    notes: [],
    activities: [
      {
        id: 'LA-4',
        type: 'created',
        summary: 'Lead created',
        createdAt: '2026-11-12T07:30:00.000Z',
        createdBy: 'System',
      },
    ],
    attachments: [],
    createdAt: '2026-11-12T07:30:00.000Z',
    updatedAt: '2026-11-12T07:30:00.000Z',
  },
  ...mockLeadsExtra,
]