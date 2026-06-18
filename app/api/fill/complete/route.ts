/**
 * Session Completion API
 * POST /api/fill/complete
 * Complete user's form filling process and trigger notifications
 */

import { SessionManager } from '@/backend/fill/session-manager';
import { sendCompletionNotification } from '@/backend/notifications';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId: string;
    };

    const { sessionId } = body;

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await SessionManager.getSession(sessionId);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Complete session
    await SessionManager.completeSession(sessionId);

    // Send SMS/email notification to user
    await sendCompletionNotification(session.phone, session.language, session.collectedData);

    return Response.json({
      sessionId,
      status: 'completed',
      phone: session.phone,
      collectedData: session.collectedData,
      messageCount: session.messages.length,
      completedAt: new Date().toISOString(),
      notificationSent: true,
    });
  } catch (error) {
    console.error('Session completion error:', error);
    return Response.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
