'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookmarkPlus, CheckCircle2, FileSearch, Sparkles } from 'lucide-react';
import { VoiceComposer } from '@/components/VoiceComposer';

type ReportQuestion = {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
};

type ReportResult = {
  id: string;
  title: string;
  owner: string;
  category: string;
  updatedAt: string;
  status: string;
  summary: string;
};

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type SearchPayload = {
  keywords: string[];
  results: ReportResult[];
};

type NavigateInsight = {
  spokenSummary: string;
  highlights: string[];
  recommendedReportId: string | null;
  confidence: 'High' | 'Medium' | 'Low';
};

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function NavigateClient() {
  const [questions, setQuestions] = useState<ReportQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Tell me what report you need. I will ask 3 questions and search automatically.',
    },
  ]);
  const [input, setInput] = useState('');
  const [payload, setPayload] = useState<SearchPayload | null>(null);
  const [selected, setSelected] = useState<ReportResult | null>(null);
  const [insight, setInsight] = useState<NavigateInsight | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[questionIndex];
  const searchDone = Boolean(payload);

  useEffect(() => {
    fetch('/api/navigate/questions')
      .then((response) => response.json())
      .then((data: { questions: ReportQuestion[] }) => {
        setQuestions(data.questions);
        setMessages((current) => [...current, { role: 'assistant', content: data.questions[0].label }]);
      });
  }, []);

  async function search(nextAnswers: Record<string, string>) {
    setLoading(true);
    const response = await fetch('/api/navigate/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: nextAnswers, other: '' }),
    });
    const data = await response.json();
    setPayload(data);
    setSelected(data.results[0] ?? null);
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content: data.results.length > 0 ? `I found ${data.results.length} report result(s).` : 'I could not find a match yet.',
      },
    ]);
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

    await search(nextAnswers);
  }

  async function explainSearch() {
    if (!payload) return;
    const response = await fetch('/api/navigate/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: payload.keywords,
        selectedReportId: selected?.id,
      }),
    });
    const data = await response.json();
    setInsight(data.insight);
    speak(data.insight.spokenSummary);
  }

  async function saveFavorite(report: ReportResult) {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report.id }),
    });
    const data = await response.json();
    setMessage(data.message);
  }

  return (
    <div className="wa-layout">
      <section className="wa-chat">
        <div className="wa-chat-header">
          <div className="wa-avatar">N</div>
          <div>
            <strong>Navigate Chatbot</strong>
            <span>Choose answers or speak into the message box</span>
          </div>
        </div>

        <div className="wa-stream">
          {messages.map((item, index) => (
            <div className={`wa-bubble ${item.role === 'user' ? 'user' : ''}`} key={`${item.role}-${index}`}>
              {item.content}
            </div>
          ))}

          {currentQuestion && !searchDone ? (
            <div className="quick-options">
              {currentQuestion.options.map((option) => (
                <button className="chip-button" key={option} type="button" onClick={() => answerCurrentQuestion(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          {loading ? <div className="wa-bubble">Searching reports...</div> : null}
        </div>

        <VoiceComposer
          value={input}
          onChange={setInput}
          onSubmit={() => answerCurrentQuestion(input)}
          placeholder={currentQuestion ? 'Type or speak your answer' : 'Search completed'}
          disabled={!currentQuestion || searchDone || loading}
        />
      </section>

      <aside className="result-panel large">
        <div className="section-head">
          <h2 className="module-title">
            <span className="icon-pill">
              <FileSearch size={22} />
            </span>
            Search Result
          </h2>
          {payload ? (
            <button className="btn" type="button" onClick={explainSearch}>
              <Sparkles size={18} />
              Explain
            </button>
          ) : null}
        </div>

        {message ? <div className="notice">{message}</div> : null}

        {payload ? (
          <>
            <div className="result-success">
              <CheckCircle2 size={20} />
              {payload.results.length} result(s)
            </div>
            <div className="keyword-row">
              {payload.keywords.map((keyword) => (
                <span className="chip" key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>

            <div className="side-list">
              {payload.results.map((report) => (
                <button
                  className={`list-button ${selected?.id === report.id ? 'active' : ''}`}
                  key={report.id}
                  type="button"
                  onClick={() => setSelected(report)}
                >
                  <strong>{report.title}</strong>
                  <small>
                    {report.category} - {report.owner} - {report.status}
                  </small>
                </button>
              ))}
            </div>

            {selected ? (
              <div className="detail-panel">
                <div className="table-wrap">
                  <table>
                    <tbody>
                      <tr>
                        <th>ID</th>
                        <td>{selected.id}</td>
                      </tr>
                      <tr>
                        <th>Updated</th>
                        <td>{selected.updatedAt}</td>
                      </tr>
                      <tr>
                        <th>Summary</th>
                        <td>{selected.summary}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="button-row">
                  <button className="btn" type="button" onClick={() => saveFavorite(selected)}>
                    <BookmarkPlus size={18} />
                    Favorite
                  </button>
                  <Link className="btn primary" href={`/view?reportId=${selected.id}`}>
                    Open PDF
                  </Link>
                </div>
              </div>
            ) : null}

            {insight ? (
              <div className="insight-panel" style={{ marginTop: 14 }}>
                <span className="status">{insight.confidence} confidence</span>
                <p>{insight.spokenSummary}</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state">Search results will appear here after the chatbot gets 3 answers.</div>
        )}
      </aside>
    </div>
  );
}
