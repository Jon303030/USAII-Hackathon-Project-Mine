import { reportQuestions } from '@/backend/navigate/chatbot';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    questions: reportQuestions(),
  });
}
