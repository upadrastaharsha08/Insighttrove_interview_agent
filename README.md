# InsightTrove Interview Agent
## Integration Guide: Adding to secure-meet

---

## 📁 Project Structure

```
insighttrove-interview-agent/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Home page with SecureMeet link
│   │   │   ├── Setup.jsx      # Resume upload + interview config
│   │   │   ├── Interview.jsx  # Live interview session
│   │   │   └── Report.jsx     # Final performance report
│   │   ├── hooks/
│   │   │   ├── useVoiceAnalysis.js   # Web Speech API + metrics
│   │   │   └── useBodyLanguage.js    # MediaPipe FaceMesh
│   │   └── utils/
│   │       └── api.js         # Axios API client
│   └── vite.config.js
├── server/                    # Node.js + Express backend
│   ├── routes/
│   │   ├── resume.js          # Parse PDF/DOCX, generate questions
│   │   ├── interview.js       # Session management, answer evaluation
│   │   └── report.js          # Final report generation
│   ├── services/
│   │   ├── claudeService.js   # All Claude API calls (3 endpoints)
│   │   └── resumeParser.js    # pdf-parse + mammoth.js
│   └── index.js
└── render.yaml                # Deploy both services to Render

```

---

## 🚀 Local Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY
```

### 3. Run Development
```bash
npm run dev
# Server → http://localhost:4000
# Client → http://localhost:3000
```

---

## 🔗 Integrating with secure-meet

The Interview Agent links back to your existing secure-meet app at:
`https://secure-meet.onrender.com`

To **add a "Practice with AI" button** inside secure-meet, add this to your existing meeting UI:

```javascript
// In your secure-meet meeting room component
<a 
  href="https://insighttrove-interview-agent.onrender.com"
  target="_blank"
  rel="noreferrer"
  className="practice-btn"
>
  🤖 AI Interview Prep
</a>
```

Or for a deeper integration, use an **iframe** to embed the Interview Agent inside secure-meet:
```html
<iframe 
  src="https://insighttrove-interview-agent.onrender.com/setup"
  width="100%" 
  height="100%"
  allow="camera; microphone"
/>
```

---

## 🧠 Claude API Usage (Cost-Optimized)

Only **3 Claude calls** per full interview session:

| Call | Trigger | Tokens (est.) |
|------|---------|----------------|
| `generateQuestions` | Resume upload → start | ~800 in / 1500 out |
| `evaluateAnswer` | Per question (8 calls) | ~400 in / 600 out × 8 |
| `generateFinalReport` | End of interview | ~600 in / 1500 out |

**Total per session: ~12,500 tokens ≈ $0.04 with claude-sonnet-4**

Caching is implemented via `node-cache` — identical resumes reuse cached questions.

---

## 🎥 Voice + Video (100% Free)

### Voice: Web Speech API
- Built into Chrome/Edge — no install required
- Continuous transcription with interim results
- Custom metrics: WPM, filler words, pause detection, confidence score

### Video: MediaPipe FaceMesh
- Loaded from CDN — no npm install required
- Tracks: eye contact %, head movement, posture via z-depth
- Graceful fallback to simulated metrics if MediaPipe fails

---

## ☁️ Deployment on Render (Free Tier)

1. Push to GitHub
2. Go to https://render.com → New → Blueprint
3. Select your repo → Render reads `render.yaml`
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Deploy both services automatically

**Both services deploy free on Render.**  
Note: Free tier spins down after inactivity — upgrade to Starter ($7/mo) for always-on.

---

## 🔄 User Flow

```
Landing Page
    ↓
Upload Resume (PDF/DOCX)
    ↓ pdf-parse / mammoth.js
Parse → Structured JSON
    ↓
Configure Interview Type + Question Count
    ↓ Claude API call #1
Generate Personalized Questions
    ↓
Live Interview Session
  ├── 🎥 MediaPipe body language tracking
  ├── 🎤 Web Speech API transcription
  ├── ⚡ Real-time hints (rule-based, FREE)
  └── ↓ Claude API call #2 (per question)
      Evaluate Answer → Score + Feedback
    ↓ Claude API call #3
Generate Final Report (overall + 3-week plan)
    ↓
Report Page → Link back to SecureMeet
```
