import { fillFromAnswers, fillFromMessage, fillReply, type FillQuestion } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    answers?: Partial<Record<FillQuestion['id'], string>>;
    language?: 'en' | 'zh';
  };
  const language = body.language === 'zh' ? 'zh' : 'en';
  const record = body.answers ? fillFromAnswers(body.answers, language) : fillFromMessage(body.message ?? '', language);

  return Response.json({
    reply: fillReply(record, language),
    record,
  });
}
