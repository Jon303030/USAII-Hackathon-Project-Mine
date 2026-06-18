'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Languages,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { VoiceComposer } from '@/components/VoiceComposer';
import { useLanguage } from '@/components/LanguageProvider';
import type { ApplicantProfile, ApplicationSection, AssistantLanguage, EligibilityStatus } from '@/backend/elderly/forms';

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type Phase =
  | 'language'
  | 'collect'
  | 'confirmName'
  | 'confirmAddress'
  | 'addressFix'
  | 'searching'
  | 'forms'
  | 'explain'
  | 'apply'
  | 'review'
  | 'consent'
  | 'complete';

type LocalText = Record<AssistantLanguage, string>;

type QuestionOption = {
  value: string;
  label: LocalText;
};

type ProfileQuestion = {
  id: keyof ApplicantProfile;
  label: LocalText;
  question: LocalText;
  placeholder: LocalText;
  options?: QuestionOption[];
};

type LocalizedField = {
  id: string;
  label: string;
  question: string;
  section: ApplicationSection;
  profileKey?: keyof ApplicantProfile;
  required: boolean;
  options?: Array<{
    value: string;
    label: string;
  }>;
};

type LocalizedForm = {
  id: string;
  title: string;
  agency: string;
  category: string;
  updatedAt: string;
  description: string;
  keyConditions: string[];
  simpleExplanation: string;
  legalNotes: string[];
  requiredFields: LocalizedField[];
  consentItems: string[];
  progressGuide: string[];
};

type SearchResult = {
  form: LocalizedForm;
  status: EligibilityStatus;
  score: number;
  matchedReasons: string[];
  missingInfo: string[];
  blockingReasons: string[];
};

type ApplicationPackage = {
  referenceId: string;
  form: LocalizedForm;
  applicantName: string;
  phone: string;
  fields: Array<{
    id: string;
    label: string;
    section: ApplicationSection;
    value: string;
    required: boolean;
  }>;
  missingFields: string[];
  consents: Array<{
    label: string;
    accepted: boolean;
  }>;
  volunteer: {
    name: string;
    confidentiality: string;
  };
  smsPreview: string;
};

const text = {
  languagePrompt: {
    en: 'Please choose a language before we start.',
    zh: '开始前，请选择语言。',
  },
  greeting: {
    en: 'Welcome. I will help you find a suitable assistance form, fill a draft, and prepare it for a volunteer to verify.',
    zh: '欢迎来到长者申请助手。我会帮您找合适的援助表格、填写草稿，并交给志愿者进一步确认。',
  },
  spellName: {
    en: 'Sorry about that. Please spell the name one letter at a time, for example L I M.',
    zh: '不好意思。请您一个字一个字母拼出来，例如 L I M。',
  },
  nameConfirm: {
    en: 'I heard your name as "{value}". Is this correct?',
    zh: '我听到您的姓名是「{value}」。这样对吗？',
  },
  addressConfirm: {
    en: 'I heard this address: {value}. Is this correct?',
    zh: '我听到的地址是：{value}。这样对吗？',
  },
  addressFix: {
    en: 'Which part should I correct?',
    zh: '请问哪一部分需要更正？',
  },
  searching: {
    en: 'Thank you. I am searching for forms that may fit your situation.',
    zh: '谢谢您。我正在根据您的情况寻找可能符合资格的表格。',
  },
  foundForms: {
    en: 'I found {count} possible form(s). You can say "first form" or tap one on the screen.',
    zh: '我找到 {count} 份可能适合的表格。您可以说「第一个表格」，也可以直接点击屏幕选择。',
  },
  noForm: {
    en: 'I could not find a strong match yet, but I will show the closest options for a volunteer to check.',
    zh: '目前没有很强的符合结果，不过我会显示最接近的选项，让志愿者之后确认。',
  },
  continueAsk: {
    en: 'Would you like to continue with this form?',
    zh: '您要继续申请这份表格吗？',
  },
  chooseAgain: {
    en: 'No problem. Please choose another form from the list.',
    zh: '没问题。请从列表选择另一份表格。',
  },
  answerAgain: {
    en: 'Please answer yes or no.',
    zh: '请回答是或不是。',
  },
  reviewReady: {
    en: 'The draft is ready. Please check the information in sections. If something is wrong, tap Edit beside that line.',
    zh: '申请草稿已经准备好了。请分阶段检查资料。如果有错，请点击该行旁边的更改。',
  },
  reviewConfirm: {
    en: 'Do all sections look correct?',
    zh: '所有资料看起来都正确吗？',
  },
  consentIntro: {
    en: 'Before completion, please read and agree to the consent items.',
    zh: '完成前，请阅读并同意这些申请条款。',
  },
  consentNeed: {
    en: 'Please tick all consent items before completing the draft.',
    zh: '请先勾选所有同意项目，才可以完成申请草稿。',
  },
  complete: {
    en: 'Done. The draft is complete. A volunteer will verify the details before any official submission.',
    zh: '完成了。申请草稿已经填好。网站会安排志愿者进一步确认资料，之后才会正式提交。',
  },
  smsQueued: {
    en: 'SMS preview has been queued in this prototype.',
    zh: '短信预览已在这个原型里排队。',
  },
  placeholder: {
    en: 'Type or speak your answer',
    zh: '输入或说出您的答案',
  },
  disabledPlaceholder: {
    en: 'This step uses buttons on the screen',
    zh: '这一步请使用屏幕上的按钮',
  },
};

const profileQuestions: ProfileQuestion[] = [
  {
    id: 'name',
    label: { en: 'Name', zh: '姓名' },
    question: { en: 'First, what is your full name?', zh: '首先，请问您的姓名是什么？' },
    placeholder: { en: 'Say your full name', zh: '说出您的姓名' },
  },
  {
    id: 'phone',
    label: { en: 'Phone', zh: '电话' },
    question: {
      en: 'What phone number should the volunteer use after checking the application?',
      zh: '志愿者确认申请后，应该用哪个电话号码联系您？',
    },
    placeholder: { en: 'Phone number', zh: '电话号码' },
  },
  {
    id: 'age',
    label: { en: 'Age', zh: '年龄' },
    question: { en: 'How old are you this year?', zh: '您今年贵庚？' },
    placeholder: { en: 'Example: 68', zh: '例如：68' },
    options: ['60', '65', '70', '75'].map((value) => ({ value, label: { en: value, zh: value } })),
  },
  {
    id: 'state',
    label: { en: 'State', zh: '州属' },
    question: { en: 'Which state do you live in?', zh: '您住在哪一个州属？' },
    placeholder: { en: 'State', zh: '州属' },
    options: ['Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak', 'Sabah', 'Sarawak', 'Melaka'].map((value) => ({
      value,
      label: { en: value, zh: value },
    })),
  },
  {
    id: 'postcode',
    label: { en: 'Postcode', zh: '邮编' },
    question: { en: 'What is your postcode?', zh: '您的邮编是多少？' },
    placeholder: { en: 'Example: 43000', zh: '例如：43000' },
  },
  {
    id: 'taman',
    label: { en: 'Taman / area', zh: '花园 / 地区' },
    question: { en: 'What is your taman or area name?', zh: '您的花园或地区名称是什么？' },
    placeholder: { en: 'Taman or area', zh: '花园或地区' },
  },
  {
    id: 'addressLine',
    label: { en: 'Street address', zh: '门牌与街道地址' },
    question: {
      en: 'Please say the house number and street address.',
      zh: '请说出您的门牌号码和街道地址。',
    },
    placeholder: { en: 'House number and street', zh: '门牌号码和街道' },
  },
  {
    id: 'maritalStatus',
    label: { en: 'Marital status', zh: '婚姻状况' },
    question: { en: 'What is your marital status?', zh: '您的婚姻状况是什么？' },
    placeholder: { en: 'Single, married, widowed, or divorced', zh: '单身、已婚、丧偶或离婚' },
    options: [
      { value: 'single', label: { en: 'Single', zh: '单身' } },
      { value: 'married', label: { en: 'Married', zh: '已婚' } },
      { value: 'widowed', label: { en: 'Widowed', zh: '丧偶' } },
      { value: 'divorced', label: { en: 'Divorced', zh: '离婚' } },
    ],
  },
  {
    id: 'children',
    label: { en: 'Children / dependants', zh: '孩子 / 受扶养人数' },
    question: {
      en: 'How many children or dependants live under your care?',
      zh: '您照顾的孩子或受扶养人数有几位？',
    },
    placeholder: { en: 'Example: 2', zh: '例如：2' },
    options: ['0', '1', '2', '3'].map((value) => ({ value, label: { en: value, zh: value } })),
  },
  {
    id: 'householdIncome',
    label: { en: 'Monthly household income', zh: '每月家庭收入' },
    question: {
      en: 'About how much is the total household income per month?',
      zh: '每月家庭总收入大概是多少？',
    },
    placeholder: { en: 'Example: 2500', zh: '例如：2500' },
    options: ['1200', '2500', '3500', '5000'].map((value) => ({ value, label: { en: `RM ${value}`, zh: `RM ${value}` } })),
  },
  {
    id: 'disability',
    label: { en: 'Disability or medical need', zh: '残障或医疗需要' },
    question: {
      en: 'Do you have any disability, long-term illness, or mobility need?',
      zh: '您是否有残障、长期疾病或行动不便的需要？',
    },
    placeholder: { en: 'Yes or no', zh: '有或没有' },
    options: [
      { value: 'yes', label: { en: 'Yes', zh: '有' } },
      { value: 'no', label: { en: 'No', zh: '没有' } },
    ],
  },
  {
    id: 'housingStatus',
    label: { en: 'Housing status', zh: '住房状况' },
    question: { en: 'Do you own, rent, or stay with family?', zh: '您是自住、租屋，还是和家人同住？' },
    placeholder: { en: 'Own, rent, family, or temporary', zh: '自住、租屋、家人同住或临时住处' },
    options: [
      { value: 'rent', label: { en: 'Rent', zh: '租屋' } },
      { value: 'own', label: { en: 'Own home', zh: '自住' } },
      { value: 'family', label: { en: 'Stay with family', zh: '和家人同住' } },
      { value: 'temporary', label: { en: 'Temporary housing', zh: '临时住处' } },
    ],
  },
];

const addressParts: Array<{ id: keyof ApplicantProfile; label: LocalText }> = [
  { id: 'state', label: { en: 'State', zh: '州属' } },
  { id: 'postcode', label: { en: 'Postcode', zh: '邮编' } },
  { id: 'taman', label: { en: 'Taman / area', zh: '花园 / 地区' } },
  { id: 'addressLine', label: { en: 'Street address', zh: '门牌与街道地址' } },
];

const phaseSteps: Array<{ id: Phase; label: LocalText }> = [
  { id: 'collect', label: { en: 'Basic info', zh: '基本资料' } },
  { id: 'forms', label: { en: 'Find forms', zh: '找表格' } },
  { id: 'apply', label: { en: 'Fill draft', zh: '填写草稿' } },
  { id: 'consent', label: { en: 'Consent', zh: '同意书' } },
  { id: 'complete', label: { en: 'Complete', zh: '完成' } },
];

const sectionLabels: Record<ApplicationSection, LocalText> = {
  personal: { en: 'Personal', zh: '个人资料' },
  address: { en: 'Address', zh: '地址' },
  household: { en: 'Household', zh: '家庭资料' },
  financial: { en: 'Financial', zh: '财务资料' },
  documents: { en: 'Documents', zh: '文件' },
};

const sectionOrder: ApplicationSection[] = ['personal', 'address', 'household', 'financial', 'documents'];

function pick<T extends LocalText>(language: AssistantLanguage, value: T) {
  return value[language];
}

function fillTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((current, [key, value]) => current.replace(`{${key}}`, String(value)), template);
}

function speak(content: string, language: AssistantLanguage) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
  window.speechSynthesis.speak(utterance);
}

function isAffirmative(value: string) {
  const normalized = value.trim().toLowerCase();
  return ['yes', 'y', 'ok', 'correct', 'continue', 'agree', 'true', '是', '对', '對', '要', '同意', '继续', '繼續'].some((term) =>
    normalized.includes(term),
  );
}

function isNegative(value: string) {
  const normalized = value.trim().toLowerCase();
  return ['no', 'n', 'wrong', 'incorrect', 'stop', 'disagree', '不是', '不对', '不對', '不要', '不同意', '错', '錯'].some((term) =>
    normalized.includes(term),
  );
}

function formatAddress(profile: ApplicantProfile) {
  return [profile.addressLine, profile.taman, profile.postcode, profile.state].filter(Boolean).join(', ');
}

function getProfileValue(profile: ApplicantProfile, field: LocalizedField, extraAnswers: Record<string, string>) {
  return extraAnswers[field.id]?.trim() || (field.profileKey ? profile[field.profileKey]?.trim() : '');
}

function statusLabel(status: EligibilityStatus, language: AssistantLanguage) {
  if (status === 'likely') return language === 'zh' ? '可能符合' : 'Likely eligible';
  if (status === 'needs-info') return language === 'zh' ? '需再确认' : 'Needs confirmation';
  return language === 'zh' ? '可能不符合' : 'Less likely';
}

export function ElderlyAssistantClient() {
  const { chooseLanguage, hasChosenLanguage, language } = useLanguage();
  const initializedRef = useRef(false);
  const previousLanguageRef = useRef<AssistantLanguage | null>(null);
  const [phase, setPhase] = useState<Phase>('collect');
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<ApplicantProfile>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [spellingMode, setSpellingMode] = useState(false);
  const [addressCorrectionId, setAddressCorrectionId] = useState<keyof ApplicantProfile | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [extraAnswers, setExtraAnswers] = useState<Record<string, string>>({});
  const [currentApplicationFieldId, setCurrentApplicationFieldId] = useState<string | null>(null);
  const [editingApplicationFieldId, setEditingApplicationFieldId] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationPackage | null>(null);
  const [consents, setConsents] = useState<boolean[]>([]);
  const [smsQueued, setSmsQueued] = useState(false);

  const currentQuestion = profileQuestions[questionIndex];
  const currentApplicationField = selectedResult?.form.requiredFields.find((field) => field.id === currentApplicationFieldId) ?? null;
  const voiceLanguage = language === 'zh' ? 'zh-CN' : 'en-US';
  const allConsentsAccepted = consents.length > 0 && consents.every(Boolean);

  useEffect(() => {
    if (!hasChosenLanguage) return;
    if (initializedRef.current && previousLanguageRef.current === language) return;
    initializedRef.current = true;
    previousLanguageRef.current = language;
    setPhase('collect');
    setProfile({});
    setQuestionIndex(0);
    setSpellingMode(false);
    setAddressCorrectionId(null);
    setInput('');
    setLoading(false);
    setResults([]);
    setSelectedResult(null);
    setExtraAnswers({});
    setCurrentApplicationFieldId(null);
    setEditingApplicationFieldId(null);
    setApplication(null);
    setConsents([]);
    setSmsQueued(false);
    setMessages([
      { role: 'assistant', content: text.greeting[language] },
      { role: 'assistant', content: pick(language, profileQuestions[0].question) },
    ]);
    speak(`${text.greeting[language]} ${pick(language, profileQuestions[0].question)}`, language);
  }, [hasChosenLanguage, language]);

  const profileRows = useMemo(
    () =>
      profileQuestions
        .filter((question) => profile[question.id])
        .map((question) => ({
          id: question.id,
          label: pick(language, question.label),
          value: profile[question.id] ?? '',
        })),
    [language, profile],
  );

  const groupedFields = useMemo(() => {
    const groups: Record<ApplicationSection, ApplicationPackage['fields']> = {
      personal: [],
      address: [],
      household: [],
      financial: [],
      documents: [],
    };
    application?.fields.forEach((field) => groups[field.section].push(field));
    return groups;
  }, [application]);

  function addAssistant(content: string, shouldSpeak = false, speechLanguage = language) {
    setMessages((current) => [...current, { role: 'assistant', content }]);
    if (shouldSpeak) speak(content, speechLanguage);
  }

  function addUser(content: string) {
    setMessages((current) => [...current, { role: 'user', content }]);
  }

  function askProfileQuestion(index: number, nextLanguage = language, spell = false) {
    const question = profileQuestions[index];
    if (!question) return;
    setQuestionIndex(index);
    setPhase('collect');
    addAssistant(spell && question.id === 'name' ? text.spellName[nextLanguage] : pick(nextLanguage, question.question), true, nextLanguage);
  }

  function selectLanguage(nextLanguage: AssistantLanguage) {
    chooseLanguage(nextLanguage);
    setPhase('collect');
    setMessages([
      { role: 'assistant', content: text.greeting[nextLanguage] },
      { role: 'assistant', content: pick(nextLanguage, profileQuestions[0].question) },
    ]);
    speak(`${text.greeting[nextLanguage]} ${pick(nextLanguage, profileQuestions[0].question)}`, nextLanguage);
  }

  function changeLanguage(nextLanguage: AssistantLanguage) {
    if (phase === 'language') {
      selectLanguage(nextLanguage);
      return;
    }
    chooseLanguage(nextLanguage);
    addAssistant(nextLanguage === 'zh' ? '已切换到华文。' : 'Switched to English.', false, nextLanguage);
  }

  function continueAfterProfileQuestion(index: number, nextProfile: ApplicantProfile) {
    const nextIndex = index + 1;
    if (nextIndex < profileQuestions.length) {
      askProfileQuestion(nextIndex);
      return;
    }
    void searchForms(nextProfile);
  }

  function answerProfileQuestion(value: string) {
    if (!currentQuestion) return;
    const nextProfile = { ...profile, [currentQuestion.id]: value };
    setProfile(nextProfile);

    if (addressCorrectionId) {
      setAddressCorrectionId(null);
      setPhase('confirmAddress');
      addAssistant(fillTemplate(text.addressConfirm[language], { value: formatAddress(nextProfile) }), true);
      return;
    }

    if (currentQuestion.id === 'name') {
      setPhase('confirmName');
      addAssistant(fillTemplate(text.nameConfirm[language], { value }), true);
      return;
    }

    if (currentQuestion.id === 'addressLine') {
      setPhase('confirmAddress');
      addAssistant(fillTemplate(text.addressConfirm[language], { value: formatAddress(nextProfile) }), true);
      return;
    }

    continueAfterProfileQuestion(questionIndex, nextProfile);
  }

  function confirmName(correct: boolean) {
    if (correct) {
      setSpellingMode(false);
      continueAfterProfileQuestion(questionIndex, profile);
      return;
    }
    setSpellingMode(true);
    askProfileQuestion(0, language, true);
  }

  function confirmAddress(correct: boolean) {
    if (correct) {
      const addressIndex = profileQuestions.findIndex((question) => question.id === 'addressLine');
      continueAfterProfileQuestion(addressIndex, profile);
      return;
    }
    setPhase('addressFix');
    addAssistant(text.addressFix[language], true);
  }

  function chooseAddressPart(value: string) {
    const normalized = value.toLowerCase();
    const selected =
      addressParts.find((part) => part.id === value) ??
      addressParts.find((part) => normalized.includes(part.id.toLowerCase()) || normalized.includes(pick(language, part.label).toLowerCase()));

    if (!selected) {
      addAssistant(text.addressFix[language]);
      return;
    }

    const index = profileQuestions.findIndex((question) => question.id === selected.id);
    if (index < 0) return;
    setAddressCorrectionId(selected.id);
    askProfileQuestion(index);
  }

  async function searchForms(nextProfile: ApplicantProfile) {
    setLoading(true);
    setPhase('searching');
    addAssistant(text.searching[language], true);
    const response = await fetch('/api/elderly/forms/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: nextProfile, language }),
    });
    const data = (await response.json()) as { results: SearchResult[] };
    setResults(data.results);
    setSelectedResult(data.results[0] ?? null);
    setPhase('forms');
    setLoading(false);
    addAssistant(
      data.results.length > 0 ? fillTemplate(text.foundForms[language], { count: data.results.length }) : text.noForm[language],
      true,
    );
  }

  function selectForm(result: SearchResult) {
    setSelectedResult(result);
    setPhase('explain');
    setApplication(null);
    setExtraAnswers({});
    setCurrentApplicationFieldId(null);
    setEditingApplicationFieldId(null);
    setConsents(new Array(result.form.consentItems.length).fill(false));
    addAssistant(`${result.form.title}: ${result.form.simpleExplanation}`, true);
    addAssistant(text.continueAsk[language], true);
  }

  function selectFormFromText(value: string) {
    const normalized = value.toLowerCase();
    const numberMatch = normalized.match(/\d+/);
    let index = numberMatch ? Number(numberMatch[0]) - 1 : -1;
    if (index < 0 && (normalized.includes('first') || normalized.includes('第一个') || normalized.includes('第一'))) index = 0;
    if (index < 0 && (normalized.includes('second') || normalized.includes('第二'))) index = 1;
    if (index < 0 && (normalized.includes('third') || normalized.includes('第三'))) index = 2;
    const titleMatch = results.find((result) => result.form.title.toLowerCase().includes(normalized));
    const result = titleMatch ?? results[index];

    if (!result) {
      addAssistant(fillTemplate(text.foundForms[language], { count: results.length }));
      return;
    }

    selectForm(result);
  }

  function findNextApplicationField(answers: Record<string, string>) {
    if (!selectedResult) return null;
    return selectedResult.form.requiredFields.find((field) => field.required && !getProfileValue(profile, field, answers)) ?? null;
  }

  function startApplication() {
    if (!selectedResult) return;
    const nextField = findNextApplicationField(extraAnswers);
    if (!nextField) {
      void buildReview(extraAnswers);
      return;
    }
    setPhase('apply');
    setCurrentApplicationFieldId(nextField.id);
    addAssistant(nextField.question, true);
  }

  async function buildReview(answers: Record<string, string>, nextConsents = consents) {
    if (!selectedResult) return;
    setLoading(true);
    const response = await fetch('/api/elderly/application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: selectedResult.form.id,
        profile,
        extraAnswers: answers,
        consents: nextConsents,
        language,
      }),
    });
    const data = (await response.json()) as { application: ApplicationPackage };
    setApplication(data.application);
    setPhase('review');
    setLoading(false);
    addAssistant(text.reviewReady[language], true);
    addAssistant(text.reviewConfirm[language]);
  }

  function answerApplicationField(value: string) {
    if (!currentApplicationField) return;
    const nextAnswers = { ...extraAnswers, [currentApplicationField.id]: value };
    setExtraAnswers(nextAnswers);

    if (editingApplicationFieldId) {
      setEditingApplicationFieldId(null);
      void buildReview(nextAnswers);
      return;
    }

    const nextField = findNextApplicationField(nextAnswers);
    if (!nextField) {
      void buildReview(nextAnswers);
      return;
    }

    setCurrentApplicationFieldId(nextField.id);
    addAssistant(nextField.question, true);
  }

  function editApplicationField(fieldId: string) {
    const field = selectedResult?.form.requiredFields.find((item) => item.id === fieldId);
    if (!field) return;
    setEditingApplicationFieldId(fieldId);
    setCurrentApplicationFieldId(fieldId);
    setPhase('apply');
    addAssistant(field.question, true);
  }

  function startConsent() {
    setPhase('consent');
    addAssistant(text.consentIntro[language], true);
  }

  async function completeApplication() {
    if (!allConsentsAccepted) {
      addAssistant(text.consentNeed[language], true);
      return;
    }
    if (!selectedResult) return;
    setLoading(true);
    const response = await fetch('/api/elderly/application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: selectedResult.form.id,
        profile,
        extraAnswers,
        consents,
        language,
      }),
    });
    const data = (await response.json()) as { application: ApplicationPackage };
    setApplication(data.application);
    setPhase('complete');
    setLoading(false);
    addAssistant(text.complete[language], true);
  }

  function submitAnswer(displayValue: string, storedValue = displayValue) {
    const answer = storedValue.trim();
    if (!answer || loading) return;
    addUser(displayValue.trim());
    setInput('');

    if (phase === 'language') {
      selectLanguage(answer.toLowerCase().includes('zh') || answer.includes('华') || answer.includes('中') ? 'zh' : 'en');
      return;
    }

    if (phase === 'collect') {
      answerProfileQuestion(answer);
      return;
    }

    if (phase === 'confirmName') {
      if (isNegative(answer)) confirmName(false);
      else if (isAffirmative(answer)) confirmName(true);
      else addAssistant(text.answerAgain[language]);
      return;
    }

    if (phase === 'confirmAddress') {
      if (isNegative(answer)) confirmAddress(false);
      else if (isAffirmative(answer)) confirmAddress(true);
      else addAssistant(text.answerAgain[language]);
      return;
    }

    if (phase === 'addressFix') {
      chooseAddressPart(answer);
      return;
    }

    if (phase === 'forms') {
      selectFormFromText(answer);
      return;
    }

    if (phase === 'explain') {
      if (isNegative(answer)) {
        setPhase('forms');
        addAssistant(text.chooseAgain[language], true);
      } else if (isAffirmative(answer)) startApplication();
      else addAssistant(text.answerAgain[language]);
      return;
    }

    if (phase === 'apply') {
      answerApplicationField(answer);
      return;
    }

    if (phase === 'review') {
      if (isNegative(answer)) addAssistant(text.reviewReady[language]);
      else if (isAffirmative(answer)) startConsent();
      else addAssistant(text.reviewReady[language]);
      return;
    }

    if (phase === 'consent') {
      if (isNegative(answer)) addAssistant(text.consentNeed[language]);
      else if (isAffirmative(answer)) void completeApplication();
      else addAssistant(text.consentNeed[language]);
    }
  }

  function toggleConsent(index: number) {
    const next = consents.map((accepted, currentIndex) => (currentIndex === index ? !accepted : accepted));
    setConsents(next);
    setApplication((current) =>
      current
        ? {
            ...current,
            consents: current.consents.map((item, currentIndex) => ({
              ...item,
              accepted: Boolean(next[currentIndex]),
            })),
          }
        : current,
    );
    setPhase('consent');
  }

  function renderQuickOptions() {
    if (phase === 'language') {
      return (
        <div className="quick-options">
          <button className="chip-button" type="button" onClick={() => selectLanguage('zh')}>
            华文
          </button>
          <button className="chip-button" type="button" onClick={() => selectLanguage('en')}>
            English
          </button>
        </div>
      );
    }

    if (phase === 'collect' && currentQuestion?.options) {
      return (
        <div className="quick-options">
          {currentQuestion.options.map((option) => (
            <button className="chip-button" key={option.value} type="button" onClick={() => submitAnswer(pick(language, option.label), pick(language, option.label))}>
              {pick(language, option.label)}
            </button>
          ))}
        </div>
      );
    }

    if (phase === 'confirmName' || phase === 'confirmAddress' || phase === 'explain' || phase === 'review') {
      return (
        <div className="quick-options">
          <button className="chip-button" type="button" onClick={() => submitAnswer(language === 'zh' ? '是' : 'Yes', 'yes')}>
            {language === 'zh' ? '是' : 'Yes'}
          </button>
          <button className="chip-button" type="button" onClick={() => submitAnswer(language === 'zh' ? '不是' : 'No', 'no')}>
            {language === 'zh' ? '不是' : 'No'}
          </button>
        </div>
      );
    }

    if (phase === 'addressFix') {
      return (
        <div className="quick-options">
          {addressParts.map((part) => (
            <button className="chip-button" key={part.id} type="button" onClick={() => submitAnswer(pick(language, part.label), part.id)}>
              {pick(language, part.label)}
            </button>
          ))}
        </div>
      );
    }

    if (phase === 'forms') {
      return (
        <div className="quick-options">
          {results.map((result, index) => (
            <button className="chip-button" key={result.form.id} type="button" onClick={() => submitAnswer(`${index + 1}. ${result.form.title}`, String(index + 1))}>
              {index + 1}. {result.form.title}
            </button>
          ))}
        </div>
      );
    }

    if (phase === 'apply' && currentApplicationField?.options) {
      return (
        <div className="quick-options">
          {currentApplicationField.options.map((option) => (
            <button className="chip-button" key={option.value} type="button" onClick={() => submitAnswer(option.label, option.label)}>
              {option.label}
            </button>
          ))}
        </div>
      );
    }

    if (phase === 'consent') {
      return (
        <div className="quick-options">
          <button className="chip-button" type="button" onClick={() => void completeApplication()}>
            {language === 'zh' ? '完成申请草稿' : 'Complete draft'}
          </button>
        </div>
      );
    }

    if (phase === 'complete' && application) {
      return (
        <div className="quick-options">
          <button
            className="chip-button"
            type="button"
            onClick={() => {
              setSmsQueued(true);
              addAssistant(text.smsQueued[language], true);
            }}
          >
            {language === 'zh' ? '排队短信' : 'Queue SMS'}
          </button>
        </div>
      );
    }

    return null;
  }

  function renderForms() {
    if (results.length === 0) return null;
    return (
      <div className="assistant-card-list">
        {results.map((result, index) => (
          <button
            className={`aid-card ${selectedResult?.form.id === result.form.id ? 'active' : ''}`}
            key={result.form.id}
            type="button"
            onClick={() => {
              addUser(`${index + 1}. ${result.form.title}`);
              selectForm(result);
            }}
          >
            <span className={`status eligibility-${result.status}`}>{statusLabel(result.status, language)}</span>
            <strong>
              {index + 1}. {result.form.title}
            </strong>
            <small>
              {result.form.agency} - {result.form.category}
            </small>
            <ul className="condition-list">
              {result.form.keyConditions.slice(0, 3).map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    );
  }

  function renderApplicationReview() {
    if (!application) return null;

    return (
      <div className="review-stack">
        <div className="result-success">
          <ClipboardCheck size={20} />
          {application.form.title}
        </div>
        <div className="reference-box">
          <span>{language === 'zh' ? '申请编号' : 'Reference'}</span>
          <strong>{application.referenceId}</strong>
        </div>
        {sectionOrder.map((section) =>
          groupedFields[section].length > 0 ? (
            <div className="review-section" key={section}>
              <h3>{pick(language, sectionLabels[section])}</h3>
              {groupedFields[section].map((field) => (
                <div className="review-row" key={field.id}>
                  <span>{field.label}</span>
                  <strong>{field.value || '-'}</strong>
                  {phase !== 'complete' ? (
                    <button className="mini-icon-btn" type="button" onClick={() => editApplicationField(field.id)} title={language === 'zh' ? '更改' : 'Edit'}>
                      <Pencil size={16} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null,
        )}
      </div>
    );
  }

  function renderConsent() {
    if (!selectedResult || (phase !== 'consent' && phase !== 'complete')) return null;
    const items = application?.consents.length ? application.consents : selectedResult.form.consentItems.map((label, index) => ({ label, accepted: consents[index] }));

    return (
      <div className="consent-list">
        {items.map((item, index) => (
          <label className="consent-item" key={item.label}>
            <input type="checkbox" checked={Boolean(consents[index])} onChange={() => toggleConsent(index)} disabled={phase === 'complete'} />
            <span>{item.label}</span>
          </label>
        ))}
        {phase === 'consent' ? (
          <button className="btn primary" type="button" disabled={!allConsentsAccepted || loading} onClick={() => void completeApplication()}>
            <CheckCircle2 size={18} />
            {language === 'zh' ? '同意并完成' : 'Agree and complete'}
          </button>
        ) : null}
      </div>
    );
  }

  function renderCompletion() {
    if (phase !== 'complete' || !application) return null;

    return (
      <div className="completion-panel">
        <div className="result-success">
          <CheckCircle2 size={20} />
          {language === 'zh' ? '申请草稿已完成' : 'Draft completed'}
        </div>
        <div className="volunteer-box">
          <strong>{application.volunteer.name}</strong>
          <p>{application.volunteer.confidentiality}</p>
        </div>
        <div className="sms-preview">
          <span>{language === 'zh' ? '短信内容预览' : 'SMS preview'}</span>
          <p>{application.smsPreview}</p>
        </div>
        {smsQueued ? <div className="notice">{text.smsQueued[language]}</div> : null}
      </div>
    );
  }

  const activeStepIndex = Math.max(
    0,
    phaseSteps.findIndex((step) => {
      if (phase === 'confirmName' || phase === 'confirmAddress' || phase === 'addressFix' || phase === 'searching') return step.id === 'collect';
      if (phase === 'explain') return step.id === 'forms';
      if (phase === 'review') return step.id === 'apply';
      return step.id === phase;
    }),
  );

  return (
    <div className="elderly-workspace">
      <section className="assistant-hero-panel">
        <div>
          <span className="eyebrow">{language === 'zh' ? '长者申请助手' : 'Senior Application Assistant'}</span>
          <h2>{language === 'zh' ? '用说话、点击和确认来完成申请草稿' : 'Complete an application draft by speaking, tapping, and confirming'}</h2>
        </div>
        <div className="language-toggle-large" aria-label={language === 'zh' ? '语言选择' : 'Language selector'}>
          <button className={language === 'zh' ? 'active' : ''} type="button" onClick={() => changeLanguage('zh')}>
            华文
          </button>
          <button className={language === 'en' ? 'active' : ''} type="button" onClick={() => changeLanguage('en')}>
            English
          </button>
        </div>
      </section>

      <div className="assistant-progress" aria-label="Application progress">
        {phaseSteps.map((step, index) => (
          <div className={`progress-step ${index <= activeStepIndex ? 'active' : ''}`} key={step.id}>
            <span>{index + 1}</span>
            {pick(language, step.label)}
          </div>
        ))}
      </div>

      <div className="wa-layout elderly-layout">
        <section className="wa-chat elder-chat">
          <div className="wa-chat-header">
            <div className="wa-avatar">
              <Languages size={20} />
            </div>
            <div>
              <strong>{language === 'zh' ? '申请助手' : 'Application Assistant'}</strong>
              <span>{language === 'zh' ? '可用华文或英文回答' : 'Answer in English or Chinese'}</span>
            </div>
          </div>

          <div className="wa-stream">
            {messages.map((message, index) => (
              <div className={`wa-bubble ${message.role === 'user' ? 'user' : ''}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {loading ? <div className="wa-bubble">{language === 'zh' ? '处理中...' : 'Working...'}</div> : null}
            {renderQuickOptions()}
          </div>

          <VoiceComposer
            value={input}
            onChange={setInput}
            onSubmit={() => submitAnswer(input)}
            placeholder={phase === 'complete' ? text.disabledPlaceholder[language] : currentQuestion?.placeholder[language] ?? text.placeholder[language]}
            disabled={phase === 'complete' || loading}
            languageCode={voiceLanguage}
          />
        </section>

        <aside className="result-panel large assistant-side-panel">
          <div className="section-head">
            <h2 className="module-title">
              <span className="icon-pill">
                <UserRound size={22} />
              </span>
              {language === 'zh' ? '屏幕确认' : 'Screen Review'}
            </h2>
          </div>

          {phase === 'language' ? (
            <div className="language-card-grid">
              <button type="button" onClick={() => selectLanguage('zh')}>
                <Languages size={22} />
                <strong>华文</strong>
              </button>
              <button type="button" onClick={() => selectLanguage('en')}>
                <Languages size={22} />
                <strong>English</strong>
              </button>
            </div>
          ) : null}

          {profileRows.length > 0 ? (
            <div className="assistant-section">
              <h3>
                <Phone size={16} />
                {language === 'zh' ? '已记录的基本资料' : 'Recorded Basic Info'}
              </h3>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {profileRows.map((row) => (
                      <tr key={row.id}>
                        <th>{row.label}</th>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {results.length > 0 ? (
            <div className="assistant-section">
              <h3>
                <Search size={16} />
                {language === 'zh' ? '符合资格的表格' : 'Matching Forms'}
              </h3>
              {renderForms()}
            </div>
          ) : null}

          {selectedResult ? (
            <div className="assistant-section">
              <h3>
                <FileText size={16} />
                {language === 'zh' ? '浅白说明' : 'Plain Explanation'}
              </h3>
              <div className="insight-panel strong">
                <p>{selectedResult.form.simpleExplanation}</p>
              </div>
              <div className="legal-note-list">
                {selectedResult.form.legalNotes.map((note) => (
                  <div className="insight-line" key={note}>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {renderApplicationReview()}
          {renderConsent()}
          {renderCompletion()}

          {application?.missingFields.length ? (
            <div className="notice">
              {language === 'zh' ? '还缺少：' : 'Still missing: '}
              {application.missingFields.join(', ')}
            </div>
          ) : null}

          {phase === 'review' && application ? (
            <div className="button-row review-actions">
              <button className="btn primary" type="button" onClick={startConsent}>
                <ShieldCheck size={18} />
                {language === 'zh' ? '资料正确，继续同意书' : 'Looks correct'}
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
