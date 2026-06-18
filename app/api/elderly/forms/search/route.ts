import { searchAssistanceForms, type ApplicantProfile, type AssistantLanguage } from '@/backend/elderly/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    language?: AssistantLanguage;
    profile?: ApplicantProfile;
  };

  const language: AssistantLanguage = body.language === 'zh' ? 'zh' : 'en';

  return Response.json({
    language,
    results: searchAssistanceForms(body.profile ?? {}, language),
  });
}
