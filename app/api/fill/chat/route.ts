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

    let result;

    if (audioData?.data) {
      // Handle audio message
      result = await processAudioMessage(sessionId, audioData.data, audioData.mimeType, language);
    } else if (message) {
      // Handle text message
      result = await processUserMessage(sessionId, message, language);
    } else {
      return Response.json(
        { error: 'Either message or audioData is required' },
        { status: 400 }
      );
    }

    return Response.json({
      sessionId: sessionId,
      reply: result.reply,
      newState: result.newState,
      extractedData: result.extractedData, 
      record: result.extractedData,
      confidence: result.confidence
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

