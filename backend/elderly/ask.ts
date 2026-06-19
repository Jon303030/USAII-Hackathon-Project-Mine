import { geminiAIService, isGeminiConfigured } from '@/backend/ai-service';
import type { AssistantLanguage } from '@/backend/elderly/forms';

type AskContext = {
  phase?: string;
  lastAssistantMessage?: string;
  profileSummary?: string;
};

export function answerElderlyQuestion(
  question: string,
  language: AssistantLanguage,
  context: AskContext = {},
): string {
  const normalized = question.trim().toLowerCase();

  if (language === 'zh') {
    if (normalized.includes('志愿者') || normalized.includes('義工') || normalized.includes('义工')) {
      return '志愿者会在您完成申请草稿后，打电话或发短信跟您确认资料，不会直接替您提交到政府部门。';
    }
    if (normalized.includes('收费') || normalized.includes('钱') || normalized.includes('费用')) {
      return '这个申请助手是免费使用的，不会向您收取任何费用。';
    }
    if (normalized.includes('隐私') || normalized.includes('资料') || normalized.includes('安全')) {
      return '您提供的资料只会用于这次援助申请，志愿者确认前不会公开给其他人。';
    }
    if (normalized.includes('多久') || normalized.includes('时间') || normalized.includes('几天')) {
      return '完成草稿后，志愿者通常会在几个工作天内联系您。正式审批时间要看相关机构。';
    }
    if (normalized.includes('资格') || normalized.includes('符合')) {
      return '我会根据您刚才提供的年龄、收入、家庭状况和住房情况，帮您找出可能符合的表格。最后仍需要志愿者确认。';
    }
    if (context.lastAssistantMessage) {
      return `关于「${context.lastAssistantMessage.slice(0, 40)}」，您可以照上面提示回答。如果不确定，也可以再说一次，我会帮您确认。`;
    }
    return '我在这里帮您。您可以继续回答上面的问题，或告诉我您不明白的地方。';
  }

  if (normalized.includes('volunteer')) {
    return 'A volunteer will contact you after the draft is ready to verify the details before any official submission.';
  }
  if (normalized.includes('fee') || normalized.includes('cost') || normalized.includes('charge')) {
    return 'This assistant is free to use. There is no charge for help with your application draft.';
  }
  if (normalized.includes('privacy') || normalized.includes('data') || normalized.includes('safe')) {
    return 'Your information is only used for this assistance application and is not shared publicly before volunteer review.';
  }
  if (normalized.includes('how long') || normalized.includes('time')) {
    return 'After the draft is complete, a volunteer usually contacts you within a few working days. Official approval depends on the agency.';
  }
  if (normalized.includes('eligible') || normalized.includes('qualif')) {
    return 'I match forms using your age, income, household, and housing details. A volunteer still confirms the final result.';
  }
  if (context.lastAssistantMessage) {
    return `About "${context.lastAssistantMessage.slice(0, 60)}", please follow the prompt above. If you are unsure, say it again and I will help confirm.`;
  }
  return 'I am here to help. You can continue with the question above or tell me what is unclear.';
}

export async function answerElderlyQuestionWithAI(
  question: string,
  language: AssistantLanguage,
  context: AskContext = {},
): Promise<string> {
  if (!isGeminiConfigured()) {
    return answerElderlyQuestion(question, language, context);
  }

  const systemPrompt =
    language === 'zh'
      ? `你是马来西亚长者政府援助申请助手。请用温暖、简单、口语化的华文回答长辈的提问。
不要编造收费信息。志愿者会在草稿完成后联系确认。回答要短，最多 3 句。`
      : `You are a senior government assistance application helper in Malaysia. Answer warmly and simply in English. Keep answers to at most 3 short sentences.`;

  const userPrompt = [
    context.phase ? `Current step: ${context.phase}` : '',
    context.lastAssistantMessage ? `Last assistant message: ${context.lastAssistantMessage}` : '',
    context.profileSummary ? `Known profile: ${context.profileSummary}` : '',
    `Senior question: ${question}`,
  ]
    .filter(Boolean)
    .join('\n');

  return geminiAIService.generateTextReply(systemPrompt, userPrompt);
}
