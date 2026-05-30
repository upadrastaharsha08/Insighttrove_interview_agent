import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, generateReport } from '../utils/api.js';

const SCORE_COLOR = (s) => s >= 75 ? '#00f5a0' : s >= 50 ? '#f59e0b' : '#ef4444';

function RadialScore({ score, label, size = 100 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = SCORE_COLOR(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e1e2e" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="50" y="54" textAnchor="middle" fill={color} fontSize="18" fontWeight="800" fontFamily="Syne, sans-serif">{score}</text>
      </svg>
      <span className="text-xs text-subtle text-center">{label}</span>
    </div>
  );
}

function Section({ title, items = [], color = 'text-accent', icon }) {
  if (!items.length) return null;
  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold text-text mb-4 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={`flex gap-3 text-sm leading-relaxed ${color === 'text-accent' ? 'text-subtle' : color}`}>
            <span className="mt-0.5 shrink-0">{icon === '✅' ? '✓' : icon === '⚠️' ? '→' : '•'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      try {
        // Try fetching existing report first
        const { data } = await getReport(sessionId);
        setReport(data.report);
      } catch {
        // If not found, generate it
        try {
          const { data } = await generateReport(sessionId);
          setReport(data.report);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to load report.');
        }
      }
      setLoading(false);
    }
    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
          <p className="font-display text-xl text-text">Generating your report...</p>
          <p className="text-subtle mt-2 text-sm">Claude is writing your coaching plan</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-danger mb-6">{error}</p>
          <button onClick={() => navigate('/setup')} className="btn-primary">Start New Interview</button>
        </div>
      </div>
    );
  }

  const sections = [
    { title: 'Strengths', items: report.strengths, color: 'text-signal', icon: '✅' },
    { title: 'Areas to Improve', items: report.weaknesses, color: 'text-warn', icon: '⚠️' },
    { title: 'Resume Gaps', items: report.resume_gaps, color: 'text-danger', icon: '📋' },
    { title: 'Action Items', items: report.improvements, color: 'text-accent-glow', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-void noise-bg">
      {/* Header */}
      <nav className="border-b border-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-text">InsightTrove</span>
          <span className="text-border">|</span>
          <span className="text-subtle text-sm">Interview Report</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/setup')} className="btn-ghost py-2 text-sm">
            New Interview
          </button>
          <button onClick={() => window.print()} className="btn-ghost py-2 text-sm">
            🖨 Print
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Overall score hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-panel border border-border rounded-full px-4 py-2 text-sm text-subtle mb-6">
            <span className="w-2 h-2 rounded-full bg-signal animate-pulse-slow" />
            AI Performance Report
          </div>
          <h1 className="font-display font-extrabold text-5xl text-text mb-4">
            Overall Score:{' '}
            <span style={{ color: SCORE_COLOR(report.overall_score) }}>
              {report.overall_score}/100
            </span>
          </h1>
          {report.summary && (
            <p className="text-subtle text-lg max-w-2xl mx-auto leading-relaxed">{report.summary}</p>
          )}
        </div>

        {/* Radial score grid */}
        <div className="card p-8 mb-8">
          <h2 className="font-display font-semibold text-text mb-8 text-center">Performance Breakdown</h2>
          <div className="flex flex-wrap justify-center gap-10">
            <RadialScore score={report.overall_score} label="Overall" size={110} />
            <RadialScore score={report.communication} label="Communication" />
            <RadialScore score={report.technical} label="Technical" />
            <RadialScore score={report.confidence} label="Confidence" />
            <RadialScore score={report.body_language} label="Body Language" />
            <RadialScore score={report.resume_strength} label="Resume Strength" />
          </div>
        </div>

        {/* Feedback sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map(s => (
            <Section key={s.title} {...s} />
          ))}
        </div>

        {/* 3-Week Prep Plan */}
        {report.next_interview_plan && (
          <div className="card p-8 mb-8">
            <h2 className="font-display font-semibold text-text mb-6 flex items-center gap-2">
              <span>🗓</span> Your 3-Week Improvement Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['week1', 'week2', 'week3'].map((w, i) => (
                <div key={w} className="bg-surface border border-border rounded-xl p-5">
                  <div className="font-mono text-accent text-xs mb-2">WEEK {i + 1}</div>
                  <p className="text-text text-sm leading-relaxed">{report.next_interview_plan[w]}</p>
                </div>
              ))}
            </div>
            {report.next_interview_plan.resources?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-subtle mb-3">Recommended Resources</p>
                <ul className="space-y-2">
                  {report.next_interview_plan.resources.map((r, i) => (
                    <li key={i} className="text-sm text-subtle flex gap-2"><span className="text-accent">→</span>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-subtle mb-6">Ready to practice again?</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/setup')} className="btn-primary px-8 py-4">
              Start Another Interview
            </button>
            <a href="https://secure-meet.onrender.com" target="_blank" rel="noreferrer" className="btn-ghost px-8 py-4">
              Practice with SecureMeet
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
