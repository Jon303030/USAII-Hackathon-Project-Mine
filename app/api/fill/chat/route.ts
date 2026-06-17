import { fillFromAnswers, fillFromMessage, fillReply, type FillQuestion } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    answers?: Partial<Record<FillQuestion['id'], string>>;
  };
  const record = body.answers ? fillFromAnswers(body.answers) : fillFromMessage(body.message ?? '');

  return Response.json({
    reply: fillReply(record),
    record,
  });
}
