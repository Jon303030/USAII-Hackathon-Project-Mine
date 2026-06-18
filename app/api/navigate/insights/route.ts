import { buildNavigateInsight } from '@/backend/navigate/chatbot';
import { reports, searchReports } from '@/backend/reports';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    keywords?: string[];
    selectedReportId?: string;
    language?: 'en' | 'zh';
  };
  const language = body.language === 'zh' ? 'zh' : 'en';
  const keywords = body.keywords ?? [];
  const matchingReports = keywords.length > 0 ? searchReports(keywords) : reports;

  return Response.json({
    insight: buildNavigateInsight(keywords, matchingReports, body.selectedReportId, language),
  });
}
