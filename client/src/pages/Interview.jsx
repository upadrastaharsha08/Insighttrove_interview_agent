import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { submitAnswer, generateReport } from '../utils/api.js';
import { useVoiceAnalysis } from '../hooks/useVoiceAnalysis.js';
import { useBodyLanguage } from '../hooks/useBodyLanguage.js';

const DIFFICULTY_COLOR = { easy: 'text-signal', medium: 'text-warn', hard: 'text-danger' };

export default function Interview() {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { transcript, isListening, metrics: voiceMetrics, realtimeHint, startListening, stopListening, resetTranscript } = useVoiceAnalysis();
  const { bodyMetrics, isTracking, startTracking, stopTracking } = useBodyLanguage(videoRef);

  const [questions] = useState(state?.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | recording | evaluating | feedback | complete
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [allEvaluations, setAllEvaluations] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const currentQuestion = questions[currentIdx];

  // Start camera on mount
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraReady(true);
        await startTracking();
      } catch (err) {
        console.warn('Camera not available:', err.message);
        setCameraReady(false);
      }
    }
    initCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      stopTracking();
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startRecording = useCallback(() => {
    resetTranscript();
    setPhase('recording');
    startListening();
  }, [resetTranscript, startListening]);

  const stopAndSubmit = useCallback(async () => {
    stopListening();
    setPhase('evaluating');
    const answer = transcript;

    const avgBodyMetrics = bodyMetrics ? {
      eyeContact: bodyMetrics.eyeContact,
      posture: bodyMetrics.posture,
      headMovement: bodyMetrics.headMovement,
    } : null;

    try {
      const { data } = await submitAnswer(
        sessionId,
        currentQuestion.id,
        answer,
        voiceMetrics,
        avgBodyMetrics
      );
      setLastEvaluation(data.evaluation);
      setAllEvaluations(prev => [...prev, data.evaluation]);
      setPhase('feedback');
    } catch (err) {
      setError('Failed to evaluate answer. Please try again.');
      setPhase('recording');
    }
  }, [transcript, voiceMetrics, bodyMetrics, sessionId, currentQuestion]);

  const nextQuestion = useCallback(async () => {
    if (currentIdx + 1 >= questions.length) {
      setPhase('complete');
      return;
    }
    setCurrentIdx(i => i + 1);
    setLastEvaluation(null);
    setPhase('ready');
    resetTranscript();
  }, [currentIdx, questions.length, resetTranscript]);

  const handleFinish = useCallback(async () => {
    setPhase('evaluating');
    try {
      stopTracking();
      await generateReport(sessionId);
      navigate(`/report/${sessionId}`);
    } catch (err) {
      setError('Failed to generate report.');
      setPhase('complete');
    }
  }, [sessionId, navigate, stopTracking]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const ScoreBar = ({ label, value, color = 'bg-accent' }) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-subtle">{label}</span>
        <span className="font-mono text-text">{value}</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  if (!currentQuestion && phase !== 'complete') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="text-subtle">No questions loaded. <button className="text-accent" onClick={() => navigate('/setup')}>Go back</button></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display font-bold text-text">InsightTrove</span>
          <span className="text-border">|</span>
          <span className="text-subtle text-sm">Interview Session</span>
        </div>
        <div className="flex items-center gap-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < currentIdx ? 'bg-signal' : i === currentIdx ? 'bg-accent' : 'bg-border'}`} />
            ))}
          </div>
          <span className="font-mono text-subtle text-sm">{currentIdx + 1} / {questions.length}</span>
        </div>
      </header>

      {/* Phase: Complete */}
      {phase === 'complete' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="font-display font-bold text-3xl text-text mb-4">Interview Complete!</h2>
            <p className="text-subtle mb-8">All {questions.length} questions answered. Generate your detailed AI report.</p>
            {error && <p className="text-danger text-sm mb-4">{error}</p>}
            <button onClick={handleFinish} className="btn-primary px-10 py-4 text-lg">
              Generate My Report →
            </button>
          </div>
        </div>
      )}

      {/* Phase: Evaluating */}
      {phase === 'evaluating' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
            <p className="font-display text-xl text-text">Claude is evaluating your answer...</p>
          </div>
        </div>
      )}

      {/* Main Interview Layout */}
      {(phase === 'ready' || phase === 'recording' || phase === 'feedback') && currentQuestion && (
        <div className="flex-1 grid grid-cols-[1fr_360px] gap-0 overflow-hidden">
          {/* Left: Main content */}
          <div className="flex flex-col p-8 overflow-y-auto">
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-4 mb-6 text-sm">{error}</div>
            )}

            {/* Question card */}
            <div className="card p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-mono uppercase tracking-widest ${DIFFICULTY_COLOR[currentQuestion.difficulty] || 'text-subtle'}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-border">·</span>
                <span className="text-xs text-subtle capitalize">{currentQuestion.type}</span>
                <span className="text-border">·</span>
                <span className="text-xs text-subtle">{currentQuestion.category}</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-text leading-relaxed">
                {currentQuestion.question}
              </h2>
              {currentQuestion.expectedTopics?.length > 0 && phase === 'feedback' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-subtle text-xs">Expected topics:</span>
                  {currentQuestion.expectedTopics.map(t => (
                    <span key={t} className="text-xs bg-panel border border-border px-2 py-0.5 rounded text-subtle">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Transcript / Recording */}
            {(phase === 'recording' || phase === 'feedback') && (
              <div className="card p-6 mb-6 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {phase === 'recording' && (
                    <>
                      <div className="w-3 h-3 rounded-full bg-danger rec-pulse" />
                      <span className="text-danger text-sm font-mono">REC {formatTime(timer)}</span>
                    </>
                  )}
                  {phase === 'feedback' && <span className="text-subtle text-sm">Your Answer</span>}
                </div>
                <p className={`leading-relaxed text-base ${transcript ? 'text-text' : 'text-muted italic'}`}>
                  {transcript || 'Start speaking — your answer will appear here...'}
                </p>
              </div>
            )}

            {/* Real-time hint */}
            {realtimeHint && phase === 'recording' && (
              <div className={`rounded-xl px-5 py-3 text-sm mb-4 border
                ${realtimeHint.type === 'warn' ? 'bg-warn/10 border-warn/30 text-warn' : 'bg-accent/10 border-accent/30 text-accent-glow'}`}>
                {realtimeHint.msg}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
              {phase === 'ready' && (
                <button onClick={startRecording} className="btn-primary flex-1 py-4 text-lg">
                  🎤 Start Answering
                </button>
              )}
              {phase === 'recording' && (
                <button onClick={stopAndSubmit} className="flex-1 py-4 bg-danger hover:bg-red-400 text-white font-display font-semibold rounded-xl transition-all">
                  ⏹ Submit Answer
                </button>
              )}
              {phase === 'feedback' && (
                <button onClick={nextQuestion} className="btn-primary flex-1 py-4 text-lg">
                  {currentIdx + 1 >= questions.length ? '🏁 Finish Interview' : 'Next Question →'}
                </button>
              )}
            </div>

            {/* Feedback panel */}
            {phase === 'feedback' && lastEvaluation && (
              <div className="card p-6 mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-text">AI Evaluation</h3>
                  <div className={`text-3xl font-display font-extrabold ${lastEvaluation.score >= 70 ? 'text-signal' : lastEvaluation.score >= 50 ? 'text-warn' : 'text-danger'}`}>
                    {lastEvaluation.score}/100
                  </div>
                </div>
                <ScoreBar label="Technical" value={lastEvaluation.technicalScore || 0} color="bg-accent" />
                <ScoreBar label="Communication" value={lastEvaluation.communicationScore || 0} color="bg-signal" />
                <ScoreBar label="Confidence" value={lastEvaluation.confidenceScore || 0} color="bg-warn" />
                <div className="border-t border-border pt-5">
                  <p className="text-subtle text-sm leading-relaxed">{lastEvaluation.feedback}</p>
                </div>
                {lastEvaluation.mistakes?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-danger mb-2">Missed</p>
                    <ul className="space-y-1">
                      {lastEvaluation.mistakes.map((m, i) => (
                        <li key={i} className="text-sm text-subtle flex gap-2"><span className="text-danger">✗</span>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {lastEvaluation.improvement && (
                  <div className="bg-signal/5 border border-signal/20 rounded-xl p-4">
                    <p className="text-xs text-signal uppercase tracking-widest mb-1">Tip</p>
                    <p className="text-sm text-text">{lastEvaluation.improvement}</p>
                  </div>
                )}
                {lastEvaluation.idealAnswer && (
                  <details className="group">
                    <summary className="cursor-pointer text-accent text-sm hover:text-accent-glow">View ideal answer outline</summary>
                    <p className="mt-3 text-sm text-subtle leading-relaxed bg-panel rounded-lg p-4">{lastEvaluation.idealAnswer}</p>
                  </details>
                )}
                {currentQuestion.followUp && (
                  <div className="bg-panel rounded-xl p-4 border border-border">
                    <p className="text-xs text-subtle uppercase tracking-widest mb-1">Follow-up</p>
                    <p className="text-sm text-text italic">"{currentQuestion.followUp}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Camera + metrics sidebar */}
          <div className="border-l border-border flex flex-col bg-surface">
            {/* Video */}
            <div className="relative aspect-video bg-void">
              <video ref={videoRef} autoPlay muted playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-panel">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📵</div>
                    <p className="text-muted text-xs">Camera unavailable</p>
                  </div>
                </div>
              )}
              {/* Body language overlay */}
              {isTracking && bodyMetrics.faceDetected && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="text-muted">👁</span>
                    <span className={bodyMetrics.eyeContact > 60 ? 'text-signal' : 'text-warn'}>{bodyMetrics.eyeContact}%</span>
                  </div>
                </div>
              )}
              {phase === 'recording' && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-danger rec-pulse" />
                  <span className="text-danger text-xs font-mono">{formatTime(timer)}</span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="flex-1 p-5 space-y-5 overflow-y-auto">
              {/* Body language metrics */}
              <div>
                <p className="text-xs uppercase tracking-widest text-subtle mb-3">Body Language</p>
                <div className="space-y-3">
                  <ScoreBar label="Eye Contact" value={bodyMetrics.eyeContact} color="bg-signal" />
                  <ScoreBar label="Posture" value={bodyMetrics.posture} color="bg-accent" />
                  <ScoreBar label="Head Movement" value={bodyMetrics.headMovement} color="bg-warn" />
                </div>
              </div>

              {/* Voice metrics */}
              <div>
                <p className="text-xs uppercase tracking-widest text-subtle mb-3">Voice Analysis</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-panel border border-border rounded-xl p-3 text-center">
                    <div className="font-mono text-2xl font-bold text-accent">{voiceMetrics.wpm}</div>
                    <div className="text-muted text-xs mt-1">WPM</div>
                  </div>
                  <div className="bg-panel border border-border rounded-xl p-3 text-center">
                    <div className={`font-mono text-2xl font-bold ${voiceMetrics.confidence > 70 ? 'text-signal' : 'text-warn'}`}>{voiceMetrics.confidence}%</div>
                    <div className="text-muted text-xs mt-1">Confidence</div>
                  </div>
                  <div className="bg-panel border border-border rounded-xl p-3 text-center">
                    <div className={`font-mono text-2xl font-bold ${voiceMetrics.fillerCount > 3 ? 'text-danger' : 'text-text'}`}>{voiceMetrics.fillerCount}</div>
                    <div className="text-muted text-xs mt-1">Fillers</div>
                  </div>
                  <div className="bg-panel border border-border rounded-xl p-3 text-center">
                    <div className="font-mono text-2xl font-bold text-text">{voiceMetrics.pauseCount}</div>
                    <div className="text-muted text-xs mt-1">Pauses</div>
                  </div>
                </div>
              </div>

              {/* Session score so far */}
              {allEvaluations.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-subtle mb-3">Running Score</p>
                  <div className="bg-panel border border-border rounded-xl p-4 text-center">
                    <div className="font-display font-extrabold text-4xl text-accent">
                      {Math.round(allEvaluations.reduce((a, e) => a + e.score, 0) / allEvaluations.length)}
                    </div>
                    <div className="text-muted text-xs mt-1">avg across {allEvaluations.length} answers</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
