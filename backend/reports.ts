export type Report = {
  id: string;
  title: string;
  owner: string;
  category: string;
  updatedAt: string;
  status: string;
  summary: string;
  keywords: string[];
};

export const reports: Report[] = [
  {
    id: 'rpt-001',
    title: 'Employee Identity Form',
    owner: 'Ali',
    category: 'HR',
    updatedAt: '2026-06-17',
    status: 'Ready',
    summary: 'Default report with name, ID, and email fields for onboarding or identity checking.',
    keywords: ['ali', 'employee', 'identity', 'id', 'email', 'hr', '1234567'],
  },
  {
    id: 'rpt-002',
    title: 'Supplier Invoice Review',
    owner: 'Finance Team',
    category: 'Finance',
    updatedAt: '2026-06-10',
    status: 'Draft',
    summary: 'Invoice validation report that can receive copy documents and merged PDF attachments.',
    keywords: ['invoice', 'supplier', 'finance', 'copy', 'payment', 'review'],
  },
  {
    id: 'rpt-003',
    title: 'Compliance Evidence Pack',
    owner: 'Compliance Desk',
    category: 'Compliance',
    updatedAt: '2026-05-28',
    status: 'Approved',
    summary: 'Evidence report for policy checks, document lookup, and final PDF export.',
    keywords: ['compliance', 'evidence', 'policy', 'audit', 'document', 'download'],
  },
  {
    id: 'rpt-004',
    title: 'Customer KYC Record',
    owner: 'Operations',
    category: 'Operations',
    updatedAt: '2026-05-21',
    status: 'Ready',
    summary: 'KYC-style record with customer identifiers, proof copies, and attachment workflow.',
    keywords: ['kyc', 'customer', 'proof', 'copy', 'operations', 'identity'],
  },
];

export function getReport(id: string) {
  return reports.find((report) => report.id === id);
}

export function searchReports(keywords: string[]) {
  if (keywords.length === 0) return reports;
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return reports
    .map((report) => {
      const haystack = [report.title, report.owner, report.category, report.status, report.summary, ...report.keywords]
        .join(' ')
        .toLowerCase();
      const score = lowerKeywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0);
      return { report, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.report);
}
