import { fillQuestions } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userName = url.searchParams.get('name') ?? 'Ali';

  return Response.json({
    questions: fillQuestions(userName),
  });
}
