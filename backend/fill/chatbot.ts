export type FillRecord = {
  name: string;
  email: string;
  id: string;
  source: string;
};

export type FillQuestion = {
  id: 'name' | 'email' | 'id';
  label: string;
  options: string[];
};

export type FillInsight = {
  spokenSummary: string;
  highlights: string[];
  missingFields: string[];
  confidence: 'High' | 'Medium' | 'Low';
};

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
type Language = 'en' | 'zh';

export function fillQuestions(userName = 'Ali', language: Language = 'en'): FillQuestion[] {
  const safeName = userName.trim() || 'Ali';
  const emailName = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '.');

  if (language === 'zh') {
    return [
      {
        id: 'name',
        label: '表格上应该填写什么姓名？',
        options: [safeName, 'Jonathan', 'Kai'],
      },
      {
        id: 'email',
        label: '应该使用哪一个电邮？',
        options: [`${emailName}@example.com`, 'ali@example.com', '手动输入'],
      },
      {
        id: 'id',
        label: '这份记录要保留哪一个 ID？',
        options: ['1234567', '之后再使用员工 ID', '没有资料'],
      },
    ];
  }

  return [
    {
      id: 'name',
      label: 'What name should I put in the form?',
      options: [safeName, 'Jonathan', 'Kai'],
    },
    {
      id: 'email',
      label: 'Which email should I use?',
      options: [`${emailName}@example.com`, 'ali@example.com', 'manual input'],
    },
    {
      id: 'id',
      label: 'Which ID should I keep for this record?',
      options: ['1234567', 'Use employee ID later', 'Not available'],
    },
  ];
}

export function fillFromMessage(message: string, language: Language = 'en'): FillRecord {
  const email = message.match(emailPattern)?.[0] ?? 'ali@example.com';
  const name = /\bali\b/i.test(message) ? 'Ali' : 'Ali';
  const id = message.match(/\b\d{5,12}\b/)?.[0] ?? '1234567';

  return {
    name,
    email,
    id,
    source: language === 'zh' ? '填写聊天助手后端占位资料' : 'Fill chatbot backend placeholder',
  };
}

export function fillFromAnswers(answers: Partial<Record<FillQuestion['id'], string>>, language: Language = 'en'): FillRecord {
  const name = answers.name?.trim() || 'Ali';
  const emailCandidate = answers.email?.trim() || '';
  const idCandidate = answers.id?.trim() || '';

  return {
    name,
    email: emailCandidate.match(emailPattern)?.[0] ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
    id: idCandidate.match(/\b\d{5,12}\b/)?.[0] ?? '1234567',
    source: language === 'zh' ? '填写聊天助手所选答案' : 'Fill chatbot selected answers',
  };
}

export function fillReply(record: FillRecord, language: Language = 'en') {
  if (language === 'zh') {
    return `我已把草稿填好：姓名 ${record.name}，电邮 ${record.email}，ID ${record.id}。`;
  }
  return `I filled the draft with name ${record.name}, email ${record.email}, and ID ${record.id}.`;
}

export function buildFillInsight(record: FillRecord, messages: string[] = [], language: Language = 'en'): FillInsight {
  const missingFields = [
    record.name ? '' : 'Name',
    record.email ? '' : 'Email',
    record.id ? '' : 'ID',
  ].filter(Boolean);
  const lastRequest = messages.filter(Boolean).at(-1) ?? 'the latest fill request';

  if (language === 'zh') {
    return {
      spokenSummary: `简单说明：我找到的姓名是 ${record.name || '未提供'}，电邮是 ${record.email || '未提供'}，ID 是 ${record.id || '未提供'}。最后一次请求是「${lastRequest}」。`,
      highlights: [
        `姓名设为 ${record.name || '未提供'}。`,
        `电邮设为 ${record.email || '未提供'}。`,
        `ID 设为 ${record.id || '未提供'}。`,
        '这些资料已经可以进入表格复核步骤。',
      ],
      missingFields,
      confidence: missingFields.length === 0 ? 'High' : 'Medium',
    };
  }

  return {
    spokenSummary: `Here is the short explanation. I found ${record.name || 'a person'}, matched the email as ${record.email || 'not provided'}, and kept the ID as ${record.id || 'not provided'}. The latest request was "${lastRequest}".`,
    highlights: [
      `Name is set to ${record.name || 'not available'}.`,
      `Email is set to ${record.email || 'not available'}.`,
      `ID is set to ${record.id || 'not available'}.`,
      'The extracted values are ready for the table review step.',
    ],
    missingFields,
    confidence: missingFields.length === 0 ? 'High' : 'Medium',
  };
}
