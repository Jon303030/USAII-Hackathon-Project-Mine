import { buildFillInsight, type FillRecord } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    record?: FillRecord;
    messages?: Array<{ content?: string }>;
    language?: 'en' | 'zh';
  };
  const language = body.language === 'zh' ? 'zh' : 'en';

  if (!body.record) {
    return Response.json({ error: language === 'zh' ? '需要填写记录。' : 'Fill record is required.' }, { status: 400 });
  }

  return Response.json({
    insight: buildFillInsight(
      body.record,
      body.messages?.map((message) => message.content ?? '') ?? [],
      language,
    ),
  });
}
