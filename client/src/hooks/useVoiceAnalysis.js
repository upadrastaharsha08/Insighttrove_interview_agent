import { useRef, useState, useCallback } from 'react';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'right', 'okay'];

export function useVoiceAnalysis() {
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const wordCountRef = useRef(0);
  const pauseCountRef = useRef(0);
  const pauseTimerRef = useRef(null);
  const fillerCountRef = useRef(0);
  const silenceThreshold = 2500; // ms

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [metrics, setMetrics] = useState({
    wpm: 0,
    fillerCount: 0,
    pauseCount: 0,
    confidence: 100,
    wordCount: 0,
  });
  const [realtimeHint, setRealtimeHint] = useState(null);

  const computeMetrics = useCallback((text, elapsedSeconds) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wpm = elapsedSeconds > 0 ? Math.round((wordCount / elapsedSeconds) * 60) : 0;

    const fillerCount = words.filter(w =>
      FILLER_WORDS.includes(w.toLowerCase().replace(/[^a-z ]/g, ''))
    ).length;

    // Confidence: penalize fillers, fast/slow speech, pauses
    let confidence = 100;
    if (wpm > 180) confidence -= 15;
    if (wpm < 80 && wpm > 0) confidence -= 10;
    if (fillerCount > 3) confidence -= fillerCount * 3;
    if (pauseCountRef.current > 4) confidence -= 10;
    confidence = Math.max(0, Math.min(100, confidence));

    // Real-time hints
    if (wpm > 190) setRealtimeHint({ type: 'warn', msg: '🐇 Slow down a bit — you\'re speaking fast' });
    else if (wpm < 70 && wpm > 0) setRealtimeHint({ type: 'info', msg: '🐢 Pick up the pace slightly' });
    else if (wordCount > 10 && wordCount < 30) setRealtimeHint({ type: 'info', msg: '💬 Expand your answer with more detail' });
    else setRealtimeHint(null);

    return { wpm, fillerCount, pauseCount: pauseCountRef.current, confidence, wordCount };
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Web Speech API not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    startTimeRef.current = Date.now();
    wordCountRef.current = 0;
    pauseCountRef.current = 0;
    fillerCountRef.current = 0;
    setTranscript('');
    setIsListening(true);

    let fullTranscript = '';

    rec.onresult = (event) => {
      // Reset pause timer on speech
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        pauseCountRef.current += 1;
      }, silenceThreshold);

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          fullTranscript += result[0].transcript + ' ';
        } else {
          interim = result[0].transcript;
        }
      }

      const display = fullTranscript + interim;
      setTranscript(display);

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = computeMetrics(display, elapsed);
      setMetrics(m);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') console.error('Speech error:', e.error);
    };

    rec.start();

    return () => stopListening();
  }, [computeMetrics]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setMetrics({ wpm: 0, fillerCount: 0, pauseCount: 0, confidence: 100, wordCount: 0 });
    setRealtimeHint(null);
  }, []);

  return { transcript, isListening, metrics, realtimeHint, startListening, stopListening, resetTranscript };
}
