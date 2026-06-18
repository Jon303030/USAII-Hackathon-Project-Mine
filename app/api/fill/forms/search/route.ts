/**
 * 表格搜索与匹配 API
 * POST /api/fill/forms/search
 * 根据用户资料匹配符合的政府表格
 */

import { SessionManager } from '@/backend/fill/session-manager';
import { FormMatcher } from '@/backend/form-matcher';

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

    // Execute form matching
    const matchResults = FormMatcher.matchForms(session.userProfile);

    // Convert to return format (multilingual support)
    const formsData = matchResults.map((result) => ({
      formId: result.form.id,
      name: result.form.languages[session.language]?.name || result.form.name,
      description: result.form.languages[session.language]?.description || result.form.description,
      matchScore: result.matchScore,
      qualificationsMet: result.qualificationsMet,
      keyQualifications: Object.entries(result.form.qualifications)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${v}`)
        .slice(0, 3),
      missingFieldsCount: result.missingFields.length,
    }));

    return Response.json({
      sessionId,
      forms: formsData,
      totalMatches: formsData.length,
      recommendation: formsData[0]?.formId || null,
    });
  } catch (error) {
    console.error('Form search error:', error);
    return Response.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
