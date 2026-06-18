import { fillQuestions } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userName = url.searchParams.get('name') ?? 'Ali';
  const language = url.searchParams.get('lang') === 'zh' ? 'zh' : 'en';

  return Response.json({
    questions: fillQuestions(userName, language),
  });
}
