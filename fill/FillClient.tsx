'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Sparkles, Table2 } from 'lucide-react';
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

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function FillClient() {
  const [questions, setQuestions] = useState<FillQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<FillQuestion['id'], string>>>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi. I will ask 3 quick questions, then fill the result table for you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [record, setRecord] = useState<FillRecord>(initialRecord);
  const [insight, setInsight] = useState<FillInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[questionIndex];
  const completed = Boolean(record.name && record.email);

  const rows = useMemo(
    () => [
      ['Name', record.name || '-'],
      ['Email', record.email || '-'],
      ['ID', record.id || '-'],
      ['Source', record.source || '-'],
    ],
    [record],
  );

  useEffect(() => {
    const rawUser = localStorage.getItem('report-workflow-user');
    const user = rawUser ? (JSON.parse(rawUser) as { name?: string }) : null;
    const name = user?.name ?? 'Ali';

    fetch(`/api/fill/questions?name=${encodeURIComponent(name)}`)
      .then((response) => response.json())
      .then((data: { questions: FillQuestion[] }) => {
        setQuestions(data.questions);
        setMessages((current) => [...current, { role: 'assistant', content: data.questions[0].label }]);
      });
  }, []);

  async function completeFill(nextAnswers: Partial<Record<FillQuestion['id'], string>>) {
    setLoading(true);
    const response = await fetch('/api/fill/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: nextAnswers }),
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
      body: JSON.stringify({ record, messages }),
    });
    const data = await response.json();
    setInsight(data.insight);
    speak(data.insight.spokenSummary);
  }

  return (
    <div className="wa-layout">
      <section className="wa-chat">
        <div className="wa-chat-header">
          <div className="wa-avatar">F</div>
          <div>
            <strong>Fill Chatbot</strong>
            <span>Answer 3 questions by tap, typing, or voice</span>
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
          {loading ? <div className="wa-bubble">Preparing result...</div> : null}
        </div>

        <VoiceComposer
          value={input}
          onChange={setInput}
          onSubmit={() => answerCurrentQuestion(input)}
          placeholder={currentQuestion ? 'Type or speak your answer' : 'Result is ready'}
          disabled={!currentQuestion || completed || loading}
        />
      </section>

      <aside className="result-panel large">
        <div className="section-head">
          <h2 className="module-title">
            <span className="icon-pill">
              <Table2 size={22} />
            </span>
            Result
          </h2>
          {completed ? (
            <button className="btn" type="button" onClick={explainResult}>
              <Sparkles size={18} />
              Explain
            </button>
          ) : null}
        </div>

        {completed ? (
          <>
            <div className="result-success">
              <CheckCircle2 size={20} />
              Result filled
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
                <span className="status">{insight.confidence} confidence</span>
                <p>{insight.spokenSummary}</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state">The filled result will appear here after 3 answers.</div>
        )}
      </aside>
    </div>
  );
}
