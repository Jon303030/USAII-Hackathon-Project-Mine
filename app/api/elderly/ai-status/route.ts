import { isGeminiConfigured } from '@/backend/elderly/chatbot';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ aiEnabled: isGeminiConfigured() });
}
