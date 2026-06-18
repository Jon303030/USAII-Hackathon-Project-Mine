'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Sparkles, Table2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { VoiceComposer } from '@/components/VoiceComposer';

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type FillQuestion = {
  id: 'name' | 'email' | 'id';
  label: string;
  options: string[];
};

type FillRecord = {
  name: string;
  email: string;
  id: string;
  source: string;
};

type FillInsight = {
  spokenSummary: string;
  highlights: string[];
  confidence: 'High' | 'Medium' | 'Low';
};

const initialRecord: FillRecord = {
  name: '',
  email: '',
  id: '',
  source: '',
};

function speak(text: string, language: 'en' | 'zh') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
  window.speechSynthesis.speak(utterance);
}

export function FillClient() {
  const { language, t } = useLanguage();
  const [questions, setQuestions] = useState<FillQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<FillQuestion['id'], string>>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [record, setRecord] = useState<FillRecord>(initialRecord);
  const [insight, setInsight] = useState<FillInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[questionIndex];
  const completed = Boolean(record.name && record.email);

  const rows = useMemo(
    () => [
      [t({ en: 'Name', zh: '姓名' }), record.name || '-'],
      [t({ en: 'Email', zh: '电邮' }), record.email || '-'],
      [t({ en: 'ID', zh: 'ID' }), record.id || '-'],
      [t({ en: 'Source', zh: '来源' }), record.source || '-'],
    ],
    [record, t],
  );

  useEffect(() => {
    setQuestionIndex(0);
    setAnswers({});
    setRecord(initialRecord);
    setInsight(null);
    setMessages([
      {
        role: 'assistant',
        content: t({
          en: 'Hi. I will ask 3 quick questions, then fill the result table for you.',
          zh: '您好。我会问三个简单问题，然后帮您填写结果表。',
        }),
      },
    ]);
    const rawUser = localStorage.getItem('report-workflow-user');
    const user = rawUser ? (JSON.parse(rawUser) as { name?: string }) : null;
    const name = user?.name ?? 'Ali';

    fetch(`/api/fill/questions?name=${encodeURIComponent(name)}&lang=${language}`)
      .then((response) => response.json())
      .then((data: { questions: FillQuestion[] }) => {
        setQuestions(data.questions);
        setMessages((current) => [...current, { role: 'assistant', content: data.questions[0].label }]);
      });
  }, [language, t]);

  async function completeFill(nextAnswers: Partial<Record<FillQuestion['id'], string>>) {
    setLoading(true);
    const response = await fetch('/api/fill/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: nextAnswers, language }),
    });
    const payload = await response.json();
    setRecord(payload.record);
    setMessages((current) => [...current, { role: 'assistant', content: payload.reply }]);
    setLoading(false);
  }

  async function answerCurrentQuestion(value: string) {
    if (!currentQuestion || !value.trim() || loading) return;
    const answer = value.trim();
    const nextAnswers = { ...answers, [currentQuestion.id]: answer };
    const nextIndex = questionIndex + 1;

    setAnswers(nextAnswers);
    setMessages((current) => [...current, { role: 'user', content: answer }]);
    setInput('');

    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex);
      setMessages((current) => [...current, { role: 'assistant', content: questions[nextIndex].label }]);
      return;
    }

    await completeFill(nextAnswers);
  }

  async function explainResult() {
    if (!completed) return;
    const response = await fetch('/api/fill/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record, messages, language }),
    });
    const data = await response.json();
    setInsight(data.insight);
    speak(data.insight.spokenSummary, language);
  }

  return (
    <div className="wa-layout">
      <section className="wa-chat">
        <div className="wa-chat-header">
          <div className="wa-avatar">F</div>
          <div>
            <strong>{t({ en: 'Fill Chatbot', zh: '填写聊天助手' })}</strong>
            <span>{t({ en: 'Answer 3 questions by tap, typing, or voice', zh: '用点击、输入或语音回答 3 个问题' })}</span>
          </div>
        </div>

        <div className="wa-stream">
          {messages.map((message, index) => (
            <div className={`wa-bubble ${message.role === 'user' ? 'user' : ''}`} key={`${message.role}-${index}`}>
              {message.content}
            </div>
          ))}
          {currentQuestion && !completed ? (
            <div className="quick-options">
              {currentQuestion.options.map((option) => (
                <button className="chip-button" key={option} type="button" onClick={() => answerCurrentQuestion(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          {loading ? <div className="wa-bubble">{t({ en: 'Preparing result...', zh: '正在准备结果...' })}</div> : null}
        </div>

        <VoiceComposer
          value={input}
          onChange={setInput}
          onSubmit={() => answerCurrentQuestion(input)}
          placeholder={currentQuestion ? t({ en: 'Type or speak your answer', zh: '输入或说出您的答案' }) : t({ en: 'Result is ready', zh: '结果已准备好' })}
          disabled={!currentQuestion || completed || loading}
          languageCode={language === 'zh' ? 'zh-CN' : 'en-US'}
        />
      </section>

      <aside className="result-panel large">
        <div className="section-head">
          <h2 className="module-title">
            <span className="icon-pill">
              <Table2 size={22} />
            </span>
            {t({ en: 'Result', zh: '结果' })}
          </h2>
          {completed ? (
            <button className="btn" type="button" onClick={explainResult}>
              <Sparkles size={18} />
              {t({ en: 'Explain', zh: '说明' })}
            </button>
          ) : null}
        </div>

        {completed ? (
          <>
            <div className="result-success">
              <CheckCircle2 size={20} />
              {t({ en: 'Result filled', zh: '结果已填写' })}
            </div>
            <div className="table-wrap">
              <table>
                <tbody>
                  {rows.map(([field, value]) => (
                    <tr key={field}>
                      <th>{field}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {insight ? (
              <div className="insight-panel" style={{ marginTop: 14 }}>
                <span className="status">
                  {insight.confidence} {t({ en: 'confidence', zh: '信心' })}
                </span>
                <p>{insight.spokenSummary}</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state">{t({ en: 'The filled result will appear here after 3 answers.', zh: '回答 3 个问题后，填写结果会显示在这里。' })}</div>
        )}
      </aside>
    </div>
  );
}
