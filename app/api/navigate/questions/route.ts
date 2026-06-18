import { reportQuestions } from '@/backend/navigate/chatbot';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const language = url.searchParams.get('lang') === 'zh' ? 'zh' : 'en';

  return Response.json({
    questions: reportQuestions(language),
  });
}
