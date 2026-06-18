import { processUserMessage, processAudioMessage } from '@/backend/fill/chatbot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId: string;
      message?: string;
      audioData?: {
        data: string; // Base64
        mimeType: string;
      };
      language?: 'zh_CN' | 'ms_MY' | 'en_US';
    };

    const { sessionId, message, audioData, language = 'zh_CN' } = body;

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    let response;

    if (audioData?.data) {
      // Handle audio message
      response = await processAudioMessage(
        sessionId,
        audioData.data,
        audioData.mimeType,
        language as any,
      );
    } else if (message) {
      // Handle text message
      response = await processUserMessage(sessionId, message, language as any);
    } else {
      return Response.json(
        { error: 'Either message or audioData is required' },
        { status: 400 },
      );
    }

    return Response.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}

