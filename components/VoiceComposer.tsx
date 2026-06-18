'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: { transcript: string };
  }>;
};

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type VoiceComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  languageCode?: string;
};

export function VoiceComposer({ value, onChange, onSubmit, placeholder, disabled, languageCode = 'en-US' }: VoiceComposerProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    setVoiceAvailable(Boolean(Recognition));

    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageCode;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();
      if (transcript) onChange(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [languageCode, onChange]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function toggleListening() {
    if (!recognitionRef.current || disabled) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    recognitionRef.current.start();
    setListening(true);
  }

  return (
    <form className="voice-composer" onSubmit={handleSubmit}>
      <input
        className="voice-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        className={`round-btn ${listening ? 'recording' : ''}`}
        type="button"
        onClick={toggleListening}
        disabled={disabled || !voiceAvailable}
        title={voiceAvailable ? 'Voice input' : 'Voice input is not supported in this browser'}
      >
        {listening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      <button className="round-btn primary" type="submit" disabled={disabled || !value.trim()} title="Send">
        <Send size={20} />
      </button>
    </form>
  );
}
