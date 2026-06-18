import { extractKeywords, reportSearchReply } from '@/backend/navigate/chatbot';
import { searchReports } from '@/backend/reports';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    answers?: Record<string, string>;
    other?: string;
    language?: 'en' | 'zh';
  };
  const keywords = extractKeywords(body.answers ?? {}, body.other ?? '');
  const results = searchReports(keywords);

  return Response.json({ ...reportSearchReply(keywords, results), language: body.language === 'zh' ? 'zh' : 'en' });
}
