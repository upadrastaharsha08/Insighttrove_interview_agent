import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, generateQuestions, startInterview } from '../utils/api.js';

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical', icon: '⚙️', desc: 'DSA, system design, coding concepts' },
  { id: 'behavioral', label: 'Behavioral', icon: '🧠', desc: 'STAR stories, soft skills, culture fit' },
  { id: 'mixed', label: 'Mixed', icon: '🎯', desc: 'Combination of technical + behavioral' },
  { id: 'hr', label: 'HR Round', icon: '🤝', desc: 'Salary, career goals, company fit' },
];

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=upload, 2=configure, 3=loading
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [interviewType, setInterviewType] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(8);
  const [error, setError] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setLoadingMsg('Parsing your resume...');
    setStep(3);
    try {
      const { data } = await uploadResume(file);
      setResumeData(data.resumeData);
      setStep(2);
      setLoadingMsg('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse resume. Please try a different file.');
      setStep(1);
    }
  };

  const handleStartInterview = async () => {
    setError('');
    setLoadingMsg('Generating personalized questions with Claude...');
    setStep(3);
    try {
      const { data: qData } = await generateQuestions(resumeData, interviewType, questionCount);
      const { data: sData } = await startInterview(resumeData, qData.questions, interviewType);
      navigate(`/interview/${sData.sessionId}`, {
        state: { resumeData, questions: qData.questions, firstQuestion: sData.firstQuestion, resumeAnalysis: qData.resumeAnalysis },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview. Check your API key.');
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-void noise-bg flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-subtle hover:text-text transition-colors">
          <span className="text-xl">←</span>
          <span className="font-display">InsightTrove</span>
        </button>
        {/* Progress steps */}
        <div className="flex items-center gap-3">
          {['Upload', 'Configure', 'Start'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all
                ${step > i + 1 ? 'bg-signal text-void' : step === i + 1 ? 'bg-accent text-white shadow-glow-sm' : 'bg-panel border border-border text-muted'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'text-text' : 'text-muted'}`}>{s}</span>
              {i < 2 && <span className="text-border mx-1">—</span>}
            </div>
          ))}
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-8">
        {/* Loading */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
            <p className="font-display text-xl text-text">{loadingMsg}</p>
            <p className="text-subtle mt-2 text-sm">This may take 10–20 seconds</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="w-full max-w-lg">
            <h2 className="font-display font-bold text-3xl text-text mb-2">Upload Your Resume</h2>
            <p className="text-subtle mb-8">We'll parse it and generate personalized interview questions</p>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-4 mb-6 text-sm">{error}</div>
            )}

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className={`card p-12 text-center cursor-pointer transition-all duration-200 border-2 border-dashed
                ${dragActive ? 'border-accent shadow-glow bg-accent/5' : 'border-border hover:border-accent/50'}`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="text-5xl mb-4">{file ? '📄' : '☁️'}</div>
              {file ? (
                <>
                  <p className="font-display font-semibold text-text">{file.name}</p>
                  <p className="text-subtle text-sm mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <p className="font-display font-semibold text-text">Drop your resume here</p>
                  <p className="text-subtle text-sm mt-2">PDF or DOCX · up to 10MB</p>
                </>
              )}
              <input id="fileInput" type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileInput} />
            </div>

            <button onClick={handleUpload} disabled={!file}
              className={`w-full mt-6 py-4 rounded-xl font-display font-semibold text-lg transition-all
                ${file ? 'btn-primary' : 'bg-panel border border-border text-muted cursor-not-allowed'}`}>
              Parse Resume →
            </button>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && resumeData && (
          <div className="w-full max-w-2xl">
            <h2 className="font-display font-bold text-3xl text-text mb-2">Configure Interview</h2>
            <p className="text-subtle mb-8">Resume parsed for <span className="text-accent font-semibold">{resumeData.name}</span></p>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-4 mb-6 text-sm">{error}</div>
            )}

            {/* Resume preview */}
            {resumeData.skills.length > 0 && (
              <div className="card p-5 mb-8">
                <p className="text-subtle text-xs uppercase tracking-widest mb-3">Detected Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.slice(0, 12).map((s, i) => (
                    <span key={i} className="bg-accent/10 border border-accent/20 text-accent-glow text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Interview type */}
            <div className="mb-8">
              <p className="font-display font-semibold text-text mb-4">Interview Type</p>
              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setInterviewType(t.id)}
                    className={`card p-4 text-left transition-all duration-200 hover:border-accent/50
                      ${interviewType === t.id ? 'border-accent shadow-glow-sm bg-accent/5' : ''}`}>
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="font-display font-semibold text-text text-sm">{t.label}</div>
                    <div className="text-subtle text-xs mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question count */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-semibold text-text">Number of Questions</p>
                <span className="font-mono text-accent font-bold text-lg">{questionCount}</span>
              </div>
              <input type="range" min={4} max={12} value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-violet-500" />
              <div className="flex justify-between text-muted text-xs mt-1">
                <span>4 (Quick)</span><span>8 (Standard)</span><span>12 (Deep)</span>
              </div>
            </div>

            <button onClick={handleStartInterview} className="btn-primary w-full py-4 text-lg">
              Generate Questions & Start →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
