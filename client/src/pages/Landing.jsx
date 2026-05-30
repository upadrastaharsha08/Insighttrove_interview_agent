import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen noise-bg bg-void flex flex-col overflow-hidden">
      {/* Grid lines background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#7c6af7 1px, transparent 1px), linear-gradient(90deg, #7c6af7 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #7c6af7 0%, transparent 70%)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-display font-bold text-sm">IT</span>
          </div>
          <span className="font-display font-semibold text-text">InsightTrove</span>
        </div>
        <a href="https://secure-meet.onrender.com" target="_blank" rel="noreferrer"
          className="btn-ghost text-sm py-2">
          🎥 SecureMeet
        </a>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 -mt-12">
        <div className="inline-flex items-center gap-2 bg-panel border border-border rounded-full px-4 py-2 text-sm text-subtle mb-8">
          <span className="w-2 h-2 rounded-full bg-signal animate-pulse-slow" />
          Powered by Claude AI · Open Source Vision
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-text leading-tight mb-6 max-w-4xl">
          Your AI Interview
          <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #7c6af7, #00f5a0)' }}>
            Coach
          </span>{' '}is Ready
        </h1>

        <p className="text-subtle text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
          Upload your resume. Practice real interviews. Get deep AI feedback on your speech, body language, and technical answers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button onClick={() => navigate('/setup')} className="btn-primary text-lg px-8 py-4">
            Start Interview Prep →
          </button>
          <a href="https://secure-meet.onrender.com" target="_blank" rel="noreferrer"
            className="btn-ghost text-lg px-8 py-4">
            Launch SecureMeet
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-16 max-w-2xl">
          {['Resume-Aware Questions', 'Voice Analysis', 'MediaPipe Body Language', 'Claude Evaluation', 'Detailed Report', 'Zero Paid APIs (except Claude)'].map(f => (
            <span key={f} className="bg-panel border border-border text-subtle text-sm px-4 py-2 rounded-full">
              {f}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg w-full">
          {[['8', 'Questions/Session'], ['5', 'Performance Metrics'], ['100%', 'Open Source Vision']].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display font-bold text-3xl text-accent">{n}</div>
              <div className="text-subtle text-xs mt-1">{l}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
