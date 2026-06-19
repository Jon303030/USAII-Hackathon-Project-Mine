import { isGeminiConfigured, processElderlyChat, type ElderlyChatInput } from '@/backend/elderly/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as ElderlyChatInput & { action?: 'init' | 'message' };
  const language = body.language === 'en' ? 'en' : 'zh';

  if (!isGeminiConfigured()) {
    return Response.json(
      {
        aiEnabled: false,
        error: language === 'zh' ? '未配置 AI API 密钥。' : 'AI API key is not configured.',
      },
      { status: 503 },
    );
  }

  try {
    const result = await processElderlyChat({
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
    });
    return Response.json(result);
  } catch (error) {
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
