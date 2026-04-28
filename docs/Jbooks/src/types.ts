/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionStatus = 'paid' | 'pending' | 'overdue' | 'draft';

export interface AccountingTransaction {
  id: string;
  date: string;
  entity: string;
  reference: string;
  category: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
}

export const MOCK_DATA: AccountingTransaction[] = [
  {
    id: 'tr-001',
    date: '2024-03-15',
    entity: 'CloudScale Solutions',
    reference: 'INV-2024-001',
    category: 'Software Subscription',
    amount: 1250.00,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly cloud infrastructure and DevOps support services.'
  },
  {
    id: 'tr-002',
    date: '2024-03-18',
    entity: 'Global Logistics Inc.',
    reference: 'EXP-99283',
    category: 'Shipping & Delivery',
    amount: 450.75,
    currency: 'USD',
    status: 'pending',
    description: 'Express shipping for client hardware replacements.'
  },
  {
    id: 'tr-003',
    date: '2024-03-20',
    entity: 'Design Foundry',
    reference: 'INV-2024-012',
    category: 'Consulting',
    amount: 3200.00,
    currency: 'USD',
    status: 'overdue',
    description: 'UI/UX Redesign phase 1 completion.'
  },
  {
    id: 'tr-004',
    date: '2024-03-22',
    entity: 'Staples Business',
    reference: 'PO-8821',
    category: 'Office Supplies',
    amount: 89.99,
    currency: 'USD',
    status: 'paid',
    description: 'Printer ink and ergonomic keyboard.'
  },
  {
    id: 'tr-005',
    date: '2024-03-25',
    entity: 'Amazon Web Services',
    reference: 'AWS-MAR-24',
    category: 'Infrastructure',
    amount: 840.12,
    currency: 'USD',
    status: 'draft',
    description: 'Compute and storage resources for production environment.'
  },
  {
    id: 'tr-006',
    date: '2024-03-26',
    entity: 'Local Coffee Roasters',
    reference: 'REC-002',
    category: 'Meals & Entertainment',
    amount: 24.50,
    currency: 'USD',
    status: 'paid',
    description: 'Team breakfast meeting.'
  },
  {
    id: 'tr-007',
    date: '2024-03-28',
    entity: 'T-Mobile Business',
    reference: 'MOB-552',
    category: 'Utilities',
    amount: 145.00,
    currency: 'USD',
    status: 'pending',
    description: 'Monthly corporate mobile data plans.'
  },
  {
    id: 'tr-008',
    date: '2024-03-29',
    entity: 'DigitalOcean',
    reference: 'DO-9921',
    category: 'Cloud Services',
    amount: 52.00,
    currency: 'USD',
    status: 'paid',
    description: 'Droplet hosting for dev environment.'
  },
  {
    id: 'tr-009',
    date: '2024-03-30',
    entity: 'Adobe Creative Cloud',
    reference: 'SU-881',
    category: 'Software Subscription',
    amount: 54.99,
    currency: 'USD',
    status: 'paid',
    description: 'Adobe Creative Cloud for teams.'
  },
  {
    id: 'tr-010',
    date: '2024-04-01',
    entity: 'JetBrains',
    reference: 'JB-2024-1',
    category: 'Software Subscription',
    amount: 199.00,
    currency: 'USD',
    status: 'paid',
    description: 'Annual IntelliJ IDEA license update.'
  },
  {
    id: 'tr-011',
    date: '2024-04-02',
    entity: 'Google Cloud Platform',
    reference: 'GCP-MAR-24',
    category: 'Infrastructure',
    amount: 245.88,
    currency: 'USD',
    status: 'pending',
    description: 'BigQuery usage and storage.'
  },
  {
    id: 'tr-012',
    date: '2024-04-03',
    entity: 'PostHog Inc.',
    reference: 'INV-PH-11',
    category: 'Product Analytics',
    amount: 89.00,
    currency: 'USD',
    status: 'paid',
    description: 'Standard plan for 1M events.'
  },
  {
    id: 'tr-013',
    date: '2024-04-04',
    entity: 'Slack Technologies',
    reference: 'SLK-2024-04',
    category: 'Communication',
    amount: 15.00,
    currency: 'USD',
    status: 'paid',
    description: 'Pro plan subscription for team collaboration.'
  },
  {
    id: 'tr-014',
    date: '2024-04-05',
    entity: 'Vercel Inc.',
    reference: 'VC-882-9',
    category: 'Hosting',
    amount: 200.00,
    currency: 'USD',
    status: 'paid',
    description: 'Pro team plan and managed edge functions.'
  },
  {
    id: 'tr-015',
    date: '2024-04-06',
    entity: 'Zoom Video Communications',
    reference: 'ZM-APR-24',
    category: 'Communication',
    amount: 149.90,
    currency: 'USD',
    status: 'paid',
    description: 'Annual business subscription.'
  },
  {
    id: 'tr-016',
    date: '2024-04-07',
    entity: 'Figma',
    reference: 'FIG-2024-002',
    category: 'Software Subscription',
    amount: 45.00,
    currency: 'USD',
    status: 'paid',
    description: 'Design seats for product team.'
  },
  {
    id: 'tr-017',
    date: '2024-04-08',
    entity: 'Intercom Inc.',
    reference: 'INT-992-B',
    category: 'Customer Support',
    amount: 345.00,
    currency: 'USD',
    status: 'pending',
    description: 'Monthly chat and help center platform.'
  },
  {
    id: 'tr-018',
    date: '2024-04-09',
    entity: 'Mailchimp',
    reference: 'MC-2024-004',
    category: 'Marketing',
    amount: 120.00,
    currency: 'USD',
    status: 'overdue',
    description: 'Email automation and newsletter hosting.'
  },
  {
    id: 'tr-019',
    date: '2024-04-10',
    entity: 'Uber for Business',
    reference: 'UBR-9921',
    category: 'Travel',
    amount: 45.60,
    currency: 'USD',
    status: 'paid',
    description: 'Travel to client site for workshop.'
  },
  {
    id: 'tr-020',
    date: '2024-04-11',
    entity: 'WeWork',
    reference: 'WW-APR-24',
    category: 'Rent',
    amount: 2500.00,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly office space rental.'
  },
  {
    id: 'tr-021',
    date: '2024-04-12',
    entity: 'Sentry',
    reference: 'SN-882-P',
    category: 'Software Subscription',
    amount: 29.00,
    currency: 'USD',
    status: 'paid',
    description: 'Error monitoring and tracing.'
  },
  {
    id: 'tr-022',
    date: '2024-04-13',
    entity: 'Heroku',
    reference: 'HK-992-M',
    category: 'Infrastructure',
    amount: 75.00,
    currency: 'USD',
    status: 'paid',
    description: 'Postgres add-on and dyno hosting.'
  },
  {
    id: 'tr-023',
    date: '2024-04-14',
    entity: 'Twilio',
    reference: 'TW-APR-24',
    category: 'Communication',
    amount: 12.50,
    currency: 'USD',
    status: 'paid',
    description: 'SMS verification and notification services.'
  },
  {
    id: 'tr-024',
    date: '2024-04-15',
    entity: 'Datadog',
    reference: 'DD-2024-001',
    category: 'Monitoring',
    amount: 450.00,
    currency: 'USD',
    status: 'pending',
    description: 'Application performance monitoring.'
  },
  {
    id: 'tr-025',
    date: '2024-04-16',
    entity: 'CircleCI',
    reference: 'CCI-APR-24',
    category: 'DevOps',
    amount: 150.00,
    currency: 'USD',
    status: 'paid',
    description: 'CI/CD pipeline execution for mobile app.'
  },
  {
    id: 'tr-026',
    date: '2024-04-17',
    entity: 'Asana',
    reference: 'AS-882-K',
    category: 'Software Subscription',
    amount: 78.00,
    currency: 'USD',
    status: 'paid',
    description: 'Project management for engineering team.'
  },
  {
    id: 'tr-027',
    date: '2024-04-18',
    entity: 'Notion',
    reference: 'NT-APR-24',
    category: 'Software Subscription',
    amount: 12.00,
    currency: 'USD',
    status: 'paid',
    description: 'Internal documentation and wiki.'
  },
  {
    id: 'tr-028',
    date: '2024-04-19',
    entity: 'Miro',
    reference: 'MR-9921',
    category: 'Software Subscription',
    amount: 16.00,
    currency: 'USD',
    status: 'paid',
    description: 'Collaborative whiteboarding tool.'
  },
  {
    id: 'tr-029',
    date: '2024-04-20',
    entity: 'Auth0 by Okta',
    reference: 'OK-2024-11',
    category: 'Security',
    amount: 245.00,
    currency: 'USD',
    status: 'pending',
    description: 'Identity and access management.'
  },
  {
    id: 'tr-030',
    date: '2024-04-21',
    entity: 'Stripe',
    reference: 'STP-9928',
    category: 'Financial Services',
    amount: 45.20,
    currency: 'USD',
    status: 'paid',
    description: 'Payment processing platform fees.'
  },
  {
    id: 'tr-031',
    date: '2024-04-22',
    entity: 'Airtable',
    reference: 'AT-APR-24',
    category: 'Software Subscription',
    amount: 24.00,
    currency: 'USD',
    status: 'paid',
    description: 'Inventory management and relational database.'
  },
  {
    id: 'tr-032',
    date: '2024-04-23',
    entity: 'Loom',
    reference: 'LM-APR-24',
    category: 'Communication',
    amount: 10.00,
    currency: 'USD',
    status: 'paid',
    description: 'Asynchronous video messaging.'
  },
  {
    id: 'tr-033',
    date: '2024-04-24',
    entity: 'SendGrid',
    reference: 'SG-2024-002',
    category: 'Communication',
    amount: 19.95,
    currency: 'USD',
    status: 'paid',
    description: 'Transactional email API services.'
  },
  {
    id: 'tr-034',
    date: '2024-04-25',
    entity: 'Zendesk',
    reference: 'ZD-APR-24',
    category: 'Customer Support',
    amount: 450.00,
    currency: 'USD',
    status: 'paid',
    description: 'Customer service ticketing software.'
  },
  {
    id: 'tr-035',
    date: '2024-04-26',
    entity: 'DocuSign',
    reference: 'DS-992-X',
    category: 'Legal',
    amount: 60.00,
    currency: 'USD',
    status: 'paid',
    description: 'Electronic signatures for client contracts.'
  },
  {
    id: 'tr-036',
    date: '2024-04-27',
    entity: 'Canva',
    reference: 'CN-APR-24',
    category: 'Marketing',
    amount: 12.99,
    currency: 'USD',
    status: 'paid',
    description: 'Social media asset creation tool.'
  },
  {
    id: 'tr-037',
    date: '2024-04-28',
    entity: 'Calendly',
    reference: 'CL-APR-24',
    category: 'Software Subscription',
    amount: 10.00,
    currency: 'USD',
    status: 'paid',
    description: 'Sales team scheduling software.'
  },
  {
    id: 'tr-038',
    date: '2024-04-29',
    entity: 'Zapier',
    reference: 'ZP-2024-003',
    category: 'Software Subscription',
    amount: 29.99,
    currency: 'USD',
    status: 'paid',
    description: 'Workflow automation and integrations.'
  },
  {
    id: 'tr-039',
    date: '2024-04-30',
    entity: 'Freshbooks',
    reference: 'FB-APR-24',
    category: 'Software Subscription',
    amount: 35.00,
    currency: 'USD',
    status: 'paid',
    description: 'Old accounting system legacy support.'
  },
  {
    id: 'tr-040',
    date: '2024-05-01',
    entity: 'Grammarly',
    reference: 'GR-APR-24',
    category: 'Software Subscription',
    amount: 12.50,
    currency: 'USD',
    status: 'paid',
    description: 'Enterprise writing assistant subscription.'
  },
  {
    id: 'tr-041',
    date: '2024-05-02',
    entity: 'Coursera',
    reference: 'CR-APR-24',
    category: 'Training',
    amount: 49.00,
    currency: 'USD',
    status: 'paid',
    description: 'Professional development for data scientists.'
  },
  {
    id: 'tr-042',
    date: '2024-05-03',
    entity: 'Udemy for Business',
    reference: 'UD-APR-24',
    category: 'Training',
    amount: 1200.00,
    currency: 'USD',
    status: 'paid',
    description: 'Annual corporate education license.'
  },
  {
    id: 'tr-043',
    date: '2024-05-04',
    entity: 'SurveyMonkey',
    reference: 'SM-APR-24',
    category: 'Marketing',
    amount: 45.00,
    currency: 'USD',
    status: 'paid',
    description: 'Customer satisfaction survey platform.'
  },
  {
    id: 'tr-044',
    date: '2024-05-05',
    entity: 'LogMeIn',
    reference: 'LMI-APR-24',
    category: 'IT Support',
    amount: 250.00,
    currency: 'USD',
    status: 'paid',
    description: 'Remote desktop and IT management software.'
  },
  {
    id: 'tr-045',
    date: '2024-05-06',
    entity: 'Cisco Webex',
    reference: 'CW-APR-24',
    category: 'Communication',
    amount: 19.95,
    currency: 'USD',
    status: 'paid',
    description: 'Video conferencing for legacy clients.'
  },
  {
    id: 'tr-046',
    date: '2024-05-07',
    entity: 'Oracle Cloud',
    reference: 'OR-APR-24',
    category: 'Infrastructure',
    amount: 890.00,
    currency: 'USD',
    status: 'pending',
    description: 'Database hosting for ERP system.'
  },
  {
    id: 'tr-047',
    date: '2024-05-08',
    entity: 'Salesforce',
    reference: 'SF-APR-24',
    category: 'Software Subscription',
    amount: 150.00,
    currency: 'USD',
    status: 'overdue',
    description: 'CRM and pipeline management tools.'
  },
  {
    id: 'tr-048',
    date: '2024-05-09',
    entity: 'HubSpot Inc.',
    reference: 'HS-APR-24',
    category: 'Marketing',
    amount: 800.00,
    currency: 'USD',
    status: 'paid',
    description: 'Inbound marketing and lead gen software.'
  },
  {
    id: 'tr-049',
    date: '2024-05-10',
    entity: 'New Relic',
    reference: 'NR-APR-24',
    category: 'Monitoring',
    amount: 45.00,
    currency: 'USD',
    status: 'paid',
    description: 'Real-time observability and telemetry.'
  },
  {
    id: 'tr-050',
    date: '2024-05-11',
    entity: 'Gainsight',
    reference: 'GS-APR-24',
    category: 'Customer Success',
    amount: 1200.00,
    currency: 'USD',
    status: 'paid',
    description: 'Customer success and proactive support.'
  }
];
