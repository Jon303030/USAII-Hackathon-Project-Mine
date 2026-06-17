import type { Report } from '../reports';

export type NavigateQuestion = {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
};

export type NavigateInsight = {
  spokenSummary: string;
  highlights: string[];
  recommendedReportId: string | null;
  confidence: 'High' | 'Medium' | 'Low';
};

export function reportQuestions(): NavigateQuestion[] {
  return [
    {
      id: 'person',
      label: '1. Who or which owner is the report related to?',
      placeholder: 'Example: Ali, Finance Team, Operations',
      options: ['Ali', 'Finance Team', 'Operations'],
    },
    {
      id: 'category',
      label: '2. Which report category or department should I search?',
      placeholder: 'Example: HR, Finance, Compliance',
      options: ['HR', 'Finance', 'Compliance'],
    },
    {
      id: 'document',
      label: '3. What document or workflow keyword matters?',
      placeholder: 'Example: identity, invoice, evidence, KYC',
      options: ['identity', 'invoice', 'evidence'],
    },
  ];
}

export function extractKeywords(input: Record<string, string>, other = '') {
  const text = [...Object.values(input), other].join(' ');
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

  return Array.from(new Set(tokens));
}

export function reportSearchReply(keywords: string[], reports: Report[]) {
  return {
    keywords,
    results: reports,
    reply: `Navigate chatbot extracted ${keywords.length} keyword(s) and found ${reports.length} report(s).`,
  };
}

export function buildNavigateInsight(keywords: string[], reports: Report[], selectedReportId?: string): NavigateInsight {
  const selected = selectedReportId ? reports.find((report) => report.id === selectedReportId) : undefined;
  const recommended = selected ?? reports[0];
  const keywordText = keywords.length > 0 ? keywords.join(', ') : 'no keywords';

  return {
    spokenSummary: recommended
      ? `Here is the short explanation. I used ${keywordText} to search the report list. The strongest match is ${recommended.title}, owned by ${recommended.owner}, with status ${recommended.status}.`
      : `Here is the short explanation. I used ${keywordText}, but there is no matching report yet.`,
    highlights: recommended
      ? [
          `Search keywords: ${keywordText}.`,
          `Recommended report: ${recommended.title}.`,
          `Owner and category: ${recommended.owner}, ${recommended.category}.`,
          `Status: ${recommended.status}.`,
        ]
      : [`Search keywords: ${keywordText}.`, 'No report result is currently selected.'],
    recommendedReportId: recommended?.id ?? null,
    confidence: recommended && keywords.length >= 2 ? 'High' : recommended ? 'Medium' : 'Low',
  };
}
