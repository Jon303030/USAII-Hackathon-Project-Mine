import { isGeminiQuotaError } from '@/backend/ai-service';
import {
  isGeminiConfigured,
  processElderlyChat,
  processElderlyChatFallback,
  type ElderlyChatInput,
} from '@/backend/elderly/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as ElderlyChatInput & { action?: 'init' | 'message' };
  const language = body.language === 'en' ? 'en' : 'zh';
  const input: ElderlyChatInput = {
    action: body.action ?? 'message',
    userMessage: body.userMessage,
    language,
    phase: body.phase ?? 'collect',
    profile: body.profile ?? {},
    questionIndex: body.questionIndex ?? 0,
    messages: body.messages ?? [],
    results: body.results ?? [],
    selectedFormId: body.selectedFormId ?? null,
    extraAnswers: body.extraAnswers ?? {},
    currentApplicationFieldId: body.currentApplicationFieldId ?? null,
    consents: body.consents ?? [],
  };

  if (!isGeminiConfigured()) {
    return Response.json(processElderlyChatFallback(input));
  }

  try {
    return Response.json(await processElderlyChat(input));
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      console.warn('Gemini quota/rate limit reached; using elderly local fallback algorithm.');
      return Response.json(processElderlyChatFallback(input));
    }

    const message = error instanceof Error ? error.message : 'Gemini request failed';
    return Response.json(
      {
        aiEnabled: true,
        error: language === 'zh' ? `AI 暂时无法回应，请稍后再试。（${message}）` : `AI is temporarily unavailable. (${message})`,
      },
      { status: 502 },
    );
  }
}
