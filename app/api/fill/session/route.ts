/**
 * Session Initialization API
 * POST /api/fill/session
 * Create or retrieve user session
 */

import { SessionManager } from '@/backend/fill/session-manager';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone: string;
      language?: 'zh_CN' | 'ms_MY' | 'en_US';
    };

    const { phone, language = 'zh_CN' } = body;

    if (!phone) {
      return Response.json({ error: 'phone is required' }, { status: 400 });
    }

    // Check if user already has session
    const existingSessions = await SessionManager.listUserSessions(phone);
    if (existingSessions.length > 0) {
      // Return latest session
      const latestSession = existingSessions[0];
      return Response.json({
        sessionId: latestSession.sessionId,
        isNew: false,
        state: latestSession.state,
      });
    }

    // Create new session
    const session = await SessionManager.createSession(phone, language as any);

    return Response.json({
      sessionId: session.sessionId,
      isNew: true,
      state: session.state,
      language: session.language,
    });
  } catch (error) {
    console.error('Session initialization error:', error);
    return Response.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
