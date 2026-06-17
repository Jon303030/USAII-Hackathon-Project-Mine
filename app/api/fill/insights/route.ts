import { buildFillInsight, type FillRecord } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    record?: FillRecord;
    messages?: Array<{ content?: string }>;
  };

  if (!body.record) {
    return Response.json({ error: 'Fill record is required.' }, { status: 400 });
  }

  return Response.json({
    insight: buildFillInsight(
      body.record,
      body.messages?.map((message) => message.content ?? '') ?? [],
    ),
  });
}
