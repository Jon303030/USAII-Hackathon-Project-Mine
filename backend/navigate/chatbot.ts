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

type Language = 'en' | 'zh';

export function reportQuestions(language: Language = 'en'): NavigateQuestion[] {
  if (language === 'zh') {
    return [
      {
        id: 'person',
        label: '1. 这份表格和哪一位用户或哪个负责人有关？',
        placeholder: '例如：Ali、财务团队、运营部',
        options: ['Ali', '财务团队', '运营部'],
      },
      {
        id: 'category',
        label: '2. 要搜索哪一种表格类别或部门？',
        placeholder: '例如：人事、财务、合规',
        options: ['人事', '财务', '合规'],
      },
      {
        id: 'document',
        label: '3. 哪一个文件或流程关键词最重要？',
        placeholder: '例如：身份、发票、证明、KYC',
        options: ['身份', '发票', '证明'],
      },
    ];
  }

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
  const ChineseKeywordMap: Array<[string, string]> = [
    ['财务', 'finance'],
    ['人事', 'hr'],
    ['合规', 'compliance'],
    ['运营', 'operations'],
    ['身份', 'identity'],
    ['发票', 'invoice'],
    ['证明', 'evidence'],
    ['文件', 'document'],
    ['客户', 'customer'],
    ['付款', 'payment'],
  ];
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

  ChineseKeywordMap.forEach(([source, target]) => {
    if (text.includes(source)) tokens.push(target);
  });

  return Array.from(new Set(tokens));
}

export function reportSearchReply(keywords: string[], reports: Report[]) {
  return {
    keywords,
    results: reports,
    reply: `Navigate chatbot extracted ${keywords.length} keyword(s) and found ${reports.length} report(s).`,
  };
}

export function buildNavigateInsight(
  keywords: string[],
  reports: Report[],
  selectedReportId?: string,
  language: Language = 'en',
): NavigateInsight {
  const selected = selectedReportId ? reports.find((report) => report.id === selectedReportId) : undefined;
  const recommended = selected ?? reports[0];
  const keywordText = keywords.length > 0 ? keywords.join(', ') : language === 'zh' ? '没有关键词' : 'no keywords';

  if (language === 'zh') {
    return {
      spokenSummary: recommended
        ? `简单说明：我使用 ${keywordText} 搜索表格列表。最接近的是 ${recommended.title}，负责人是 ${recommended.owner}，状态是 ${recommended.status}。`
        : `简单说明：我使用 ${keywordText} 搜索，但目前还没有匹配表格。`,
      highlights: recommended
        ? [
            `搜索关键词：${keywordText}。`,
            `建议表格：${recommended.title}。`,
            `负责人和类别：${recommended.owner}，${recommended.category}。`,
            `状态：${recommended.status}。`,
          ]
        : [`搜索关键词：${keywordText}。`, '目前没有选择任何表格。'],
      recommendedReportId: recommended?.id ?? null,
      confidence: recommended && keywords.length >= 2 ? 'High' : recommended ? 'Medium' : 'Low',
    };
  }

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
