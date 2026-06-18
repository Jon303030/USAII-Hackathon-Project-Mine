import { buildApplicationPackage, type ApplicantProfile, type AssistantLanguage } from '@/backend/elderly/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    formId?: string;
    profile?: ApplicantProfile;
    extraAnswers?: Record<string, string>;
    consents?: boolean[];
    language?: AssistantLanguage;
  };

  const language: AssistantLanguage = body.language === 'zh' ? 'zh' : 'en';

  return Response.json({
    application: buildApplicationPackage({
      formId: body.formId ?? 'senior-living-support',
      profile: body.profile ?? {},
      extraAnswers: body.extraAnswers ?? {},
      consents: body.consents ?? [],
      language,
    }),
  });
}
