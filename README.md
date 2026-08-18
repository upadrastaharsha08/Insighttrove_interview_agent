# 🎯 InsightTrove Interview Agent

### AI-Powered Interview Practice & Performance Intelligence

**InsightTrove Interview Agent** is an AI-powered interview practice platform designed to simulate realistic technical and behavioral interviews while analyzing not only **what you say**, but also **how you communicate**.

Upload your resume, configure your interview, answer AI-generated questions, and receive a detailed performance report covering:

* 🧠 Answer quality
* 🎯 Technical correctness
* 🗣️ Communication
* ⚡ Speaking pace
* 🧩 Filler-word usage
* ⏱️ Pauses and response timing
* 👁️ Eye-contact behavior
* 🧍 Head movement and posture
* 📊 Overall interview performance
* 📚 Personalized improvement plan

> **Practice like it's real. Analyze like it's data. Improve like a professional.**

---

## ✨ Why InsightTrove?

Traditional interview-preparation platforms mainly evaluate the **content of an answer**.

InsightTrove takes a broader approach.

```text
                    ┌───────────────────────────┐
                    │       Candidate           │
                    │ Resume + Interview Setup  │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   Resume Intelligence     │
                    │ PDF / DOCX → Structured   │
                    │ Candidate Profile         │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   AI Question Generator   │
                    │ Personalized Interview    │
                    │ Questions                 │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
              ┌────────────────────────────────────────┐
              │          LIVE INTERVIEW               │
              │                                        │
              │  🎤 Voice        🎥 Video              │
              │  Transcription   Face / Head Analysis │
              │  WPM             Eye Contact           │
              │  Fillers         Posture               │
              └───────────────────┬────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │    AI Answer Evaluator    │
                    │ Content + Communication   │
                    │ + Technical Relevance     │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   Interview Intelligence  │
                    │ Score + Insights + Gaps   │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │      Final Report         │
                    │ Performance + Action Plan │
                    └───────────────────────────┘
```

---

# 🚀 Core Features

## 📄 Resume Intelligence

Upload a candidate resume in:

* PDF
* DOCX

The backend extracts relevant information and converts the resume into structured candidate context.

The AI uses this information to create questions relevant to the candidate's:

* Experience
* Skills
* Projects
* Technologies
* Job responsibilities
* Career level

---

## 🤖 Personalized AI Interviews

Instead of asking generic questions, InsightTrove generates questions based on the candidate profile.

Example:

```text
Resume:
4 years
Playwright
Python
Pytest
AI Automation
CI/CD

            ↓

AI Interview

Q1 → Explain your Playwright framework architecture.

Q2 → How do you implement parallel execution?

Q3 → How have you integrated AI into test automation?

Q4 → Explain a production failure you diagnosed.

Q5 → Design an AI-powered self-healing test framework.
```

Interview configuration can include:

* Interview type
* Difficulty
* Number of questions
* Technical / behavioral focus
* Role-specific questioning

---

# 🎤 Voice Intelligence

InsightTrove uses the browser's **Web Speech API** for real-time speech recognition.

No external speech-to-text service is required.

### Metrics

The interview engine can analyze:

| Metric         | Description                           |
| -------------- | ------------------------------------- |
| WPM            | Words spoken per minute               |
| Filler Words   | "um", "uh", "like", etc.              |
| Pause Duration | Time spent silent                     |
| Response Time  | Time before answering                 |
| Transcript     | Real-time answer transcription        |
| Confidence     | Browser speech recognition confidence |

Example:

```text
Speaking Analysis
────────────────────────────

Words / Minute       142
Filler Words          8
Average Pause        1.4 sec
Response Time        3.2 sec

Communication Score  86 / 100
```

---

# 🎥 Body Language Intelligence

The browser camera can be analyzed using **MediaPipe FaceMesh**.

The system can derive behavioral signals such as:

* 👁️ Eye-contact percentage
* ↔️ Head movement
* 🧍 Posture indicators
* 📐 Face orientation
* 🎯 Engagement signals

If camera analysis is unavailable, the application gracefully falls back to simulated/demo metrics.

> **Privacy note:** Camera and microphone access are browser-controlled and require explicit user permission.

---

# 🧠 AI Architecture

InsightTrove intentionally keeps AI calls limited to reduce latency and cost.

### Interview AI Pipeline

```text
Resume
   │
   ▼
Resume Parser
   │
   ▼
Candidate Profile
   │
   ▼
Claude
   │
   ▼
Personalized Questions
   │
   ▼
Live Interview
   │
   ├───────────────┐
   │               │
   ▼               ▼
Voice Analysis   Video Analysis
   │               │
   └───────┬───────┘
           ▼
      Answer Transcript
           │
           ▼
     Claude Evaluation
           │
           ▼
   Score + Feedback
           │
           ▼
     Final Interview
        Report
```

---

# 💰 Cost-Optimized AI Design

InsightTrove is designed around a small number of AI operations.

| Operation           | Trigger          |             Approx. Tokens |
| ------------------- | ---------------- | -------------------------: |
| Question Generation | Interview starts | ~800 input / ~1,500 output |
| Answer Evaluation   | Each question    |   ~400 input / ~600 output |
| Final Report        | Interview ends   | ~600 input / ~1,500 output |

For an 8-question interview:

```text
Question Generation
        +
8 × Answer Evaluation
        +
Final Report
        ↓
~12,500 tokens / session
```

Caching is implemented using `node-cache` so identical resume/question-generation requests can reuse previously generated results.

> Token usage and pricing vary by model and provider. Treat the estimates above as engineering estimates rather than fixed pricing.

---

# 🔗 SecureMeet Integration

InsightTrove can work independently or integrate with the existing **SecureMeet** application.

### Existing SecureMeet Application

```text
https://secure-meet.onrender.com
```

The simplest integration is to add an **AI Interview Prep** entry point to the SecureMeet meeting interface.

### Recommended Integration

```text
SecureMeet
    │
    ├── Meetings
    ├── Participants
    ├── Collaboration
    │
    └── 🤖 AI Interview Prep
                │
                ▼
       InsightTrove Interview Agent
```

### External Launch

```html
<a
  href="https://insighttrove-interview-agent.onrender.com"
  target="_blank"
  rel="noreferrer"
  className="practice-btn"
>
  🤖 AI Interview Prep
</a>
```

---

# 🖥️ Embedded Integration

For a deeper SecureMeet integration, InsightTrove can be embedded using an iframe.

```html
<iframe
  src="https://insighttrove-interview-agent.onrender.com/setup"
  width="100%"
  height="100%"
  allow="camera; microphone"
></iframe>
```

### Recommended Production Considerations

If iframe embedding is enabled, configure the application to explicitly allow only trusted parent origins.

Consider:

* CSP `frame-ancestors`
* CORS configuration
* Authentication/session sharing
* Camera permissions
* Microphone permissions
* Secure HTTPS communication

Do not use unrestricted `*` policies in production.

---

# 🔄 Complete User Journey

```text
┌──────────────────────┐
│     Landing Page     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Upload Resume     │
│     PDF / DOCX       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Resume Parsing    │
│ pdf-parse / mammoth  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Interview Setup      │
│ Type / Difficulty    │
│ Question Count       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ AI Question Engine   │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────┐
│      Live Interview        │
│                            │
│ 🎤 Voice Analysis          │
│ 🎥 Face / Body Analysis    │
│ ⚡ Real-Time Rule Hints     │
└────────────┬───────────────┘
             │
             ▼
┌──────────────────────┐
│ Answer Evaluation    │
│ Score + Feedback     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Final Report         │
│ Overall Performance  │
│ Strengths            │
│ Weaknesses           │
│ Improvement Plan     │
└──────────────────────┘
```

---

# 📊 Performance Report

At the end of the interview, candidates receive a consolidated report.

### Example

```text
╔══════════════════════════════════╗
║       INTERVIEW REPORT           ║
╠══════════════════════════════════╣
║ Overall Score          84 / 100   ║
║ Technical              88 / 100   ║
║ Communication          82 / 100   ║
║ Confidence             86 / 100   ║
║ Body Language          79 / 100   ║
╚══════════════════════════════════╝
```

### Report Sections

#### Overall Performance

A high-level summary of the interview.

#### Technical Performance

Evaluates:

* Correctness
* Relevance
* Depth
* Practical knowledge
* Problem-solving ability

#### Communication

Analyzes:

* Clarity
* Conciseness
* Speaking pace
* Filler words
* Pauses

#### Body Language

Analyzes available visual signals such as:

* Eye contact
* Head movement
* Posture indicators

#### Strengths

Identifies areas where the candidate performed well.

#### Improvement Areas

Highlights specific weaknesses.

#### Personalized Action Plan

Provides a practical improvement roadmap.

Example:

```text
Week 1
→ Improve answer structure
→ Reduce filler words

Week 2
→ Practice system-design questions
→ Improve concise explanations

Week 3
→ Conduct timed mock interviews
→ Practice behavioral responses
```

---

# 🏗️ Project Architecture

```text
insighttrove-interview-agent/
│
├── client/
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Setup.jsx
│   │   │   ├── Interview.jsx
│   │   │   └── Report.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useVoiceAnalysis.js
│   │   │   └── useBodyLanguage.js
│   │   │
│   │   └── utils/
│   │       └── api.js
│   │
│   └── vite.config.js
│
├── server/
│   │
│   ├── routes/
│   │   ├── resume.js
│   │   ├── interview.js
│   │   └── report.js
│   │
│   ├── services/
│   │   ├── claudeService.js
│   │   └── resumeParser.js
│   │
│   └── index.js
│
├── render.yaml
├── package.json
└── README.md
```

---

# ⚙️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* Web Speech API
* MediaPipe FaceMesh
* Axios

## Backend

* Node.js
* Express
* PDF parsing
* DOCX parsing
* Claude API
* Node Cache

## Deployment

* Render
* GitHub
* Render Blueprint

---

# 🔌 Backend Responsibilities

### `/routes/resume.js`

Responsible for:

* Resume upload
* PDF parsing
* DOCX parsing
* Candidate profile extraction
* Question generation

### `/routes/interview.js`

Responsible for:

* Interview sessions
* Question progression
* Answer submission
* Answer evaluation
* Session state

### `/routes/report.js`

Responsible for:

* Aggregating interview metrics
* Generating final AI report
* Building improvement recommendations

---

# 🧩 Service Layer

### `claudeService.js`

Centralizes AI interactions.

```text
claudeService
      │
      ├── generateQuestions()
      │
      ├── evaluateAnswer()
      │
      └── generateFinalReport()
```

Keeping AI interactions in one service makes it easier to:

* Change models
* Add caching
* Monitor token usage
* Add retries
* Implement structured outputs
* Switch providers later

---

# 🛠️ Local Development

## Prerequisites

Make sure you have:

* Node.js
* npm
* Git
* An Anthropic API key
* Modern Chromium-based browser for voice/video features

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>

cd insighttrove-interview-agent
```

---

## 2. Install Dependencies

```bash
npm run install:all
```

---

## 3. Configure Environment Variables

Create the server environment file:

```bash
cp server/.env.example server/.env
```

Then configure:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Never commit `.env` files or API keys to Git.

---

## 4. Start Development

```bash
npm run dev
```

The application will be available at:

```text
Frontend
http://localhost:3000

Backend
http://localhost:4000
```

---

# ☁️ Deployment with Render

InsightTrove supports deployment using a Render Blueprint.

### Deployment Flow

```text
GitHub Repository
       │
       ▼
Render Blueprint
       │
       ├── Frontend Service
       │
       └── Backend Service
```

### Steps

1. Push the project to GitHub.
2. Open Render.
3. Create a new Blueprint.
4. Select the repository.
5. Render reads `render.yaml`.
6. Configure `ANTHROPIC_API_KEY`.
7. Deploy the services.

The exact cost and availability of Render's free offerings can change, so verify the current Render plan before relying on a free-tier deployment.

---

# 🔐 Security & Privacy

Interview applications process potentially sensitive information such as resumes, transcripts, voice data, and camera-derived signals.

Production deployments should therefore implement:

* HTTPS
* Secure API keys
* Environment-based secrets
* File type validation
* Upload size limits
* Authentication
* Authorization
* Rate limiting
* Input validation
* Secure CORS policies
* Content Security Policy
* Secure iframe policies
* Temporary file cleanup
* Appropriate data retention policies

### Important

Do not expose:

```text
ANTHROPIC_API_KEY
```

to the React frontend.

All provider API calls should be performed server-side.

---

# ⚡ Performance Philosophy

InsightTrove follows a simple principle:

> **AI where intelligence is required. Browser APIs where they are sufficient.**

Instead of sending every event to an AI model:

```text
Real-time voice
       │
       └── Browser processing

Real-time video
       │
       └── Local MediaPipe processing

Simple hints
       │
       └── Rule-based engine

Complex reasoning
       │
       └── Claude
```

This approach helps reduce:

* API costs
* Latency
* Network traffic
* Infrastructure complexity

---

# 📈 Future Roadmap

## Phase 1 — Foundation

* [x] Resume upload
* [x] PDF/DOCX parsing
* [x] Personalized questions
* [x] Live interview
* [x] Voice transcription
* [x] Answer evaluation
* [x] Final report

## Phase 2 — Interview Intelligence

* [ ] Adaptive questioning
* [ ] Difficulty adjustment
* [ ] Role-specific interview templates
* [ ] Question difficulty scoring
* [ ] Better communication analytics
* [ ] Interview history

## Phase 3 — Advanced AI

* [ ] Multi-agent interview engine
* [ ] Dynamic follow-up questions
* [ ] Interviewer personality simulation
* [ ] Job-description-to-interview generation
* [ ] Resume-to-JD skill-gap analysis
* [ ] AI-generated interview scenarios

## Phase 4 — SecureMeet Integration

* [ ] Native SecureMeet authentication
* [ ] Embedded interview mode
* [ ] Shared user profiles
* [ ] Interview session linking
* [ ] SecureMeet meeting-to-interview workflow

---

# 🧠 Future Multi-Agent Architecture

The platform can evolve from a single AI service into a specialized agent architecture:

```text
                    ┌─────────────────────┐
                    │ Interview Orchestrator│
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ Resume Agent  │      │ Interviewer   │      │ Evaluation    │
│               │      │ Agent         │      │ Agent         │
└───────────────┘      └───────────────┘      └───────────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Communication │
                       │ Agent         │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Report Agent  │
                       └───────────────┘
```

This architecture would allow InsightTrove to dynamically decide:

```text
Candidate Answer
      │
      ▼
Is the answer incomplete?
      │
   ┌──┴──┐
  YES    NO
   │      │
   ▼      ▼
Follow-up  Next Question
Question
```

---

# 🎯 Example Use Cases

InsightTrove can be used for:

### 👨‍💻 Technical Interviews

* Software Engineering
* QA Automation
* SDET
* DevOps
* Data Engineering
* AI/ML
* Cloud Engineering

### 💼 Behavioral Interviews

* Leadership
* Communication
* Conflict resolution
* Team management
* Ownership
* Career discussions

### 🎓 Interview Preparation

Candidates can repeatedly practice and track improvement over time.

### 🏢 Corporate Training

Organizations can use the platform for internal interview preparation and employee development.

---

# 🗺️ Product Vision

InsightTrove is designed to become more than an interview-question generator.

The long-term vision is an **AI Interview Intelligence Platform** that understands:

```text
WHO YOU ARE
     +
WHAT YOU KNOW
     +
HOW YOU ANSWER
     +
HOW YOU COMMUNICATE
     +
HOW YOU PRESENT YOURSELF
     ↓
HOW YOU CAN IMPROVE
```

The goal is to transform interview preparation from:

```text
Question → Answer → Done
```

into:

```text
Practice
   ↓
Observe
   ↓
Analyze
   ↓
Understand
   ↓
Improve
   ↓
Practice Again
```

---

# 🤝 Contributing

Contributions are welcome.

Typical contribution areas include:

* New interview types
* AI evaluation strategies
* Resume parsing improvements
* Voice analytics
* Computer vision metrics
* UI/UX improvements
* Performance optimization
* Security improvements
* SecureMeet integrations

### Contribution Workflow

```bash
git checkout -b feature/my-feature

# Make your changes

git add .

git commit -m "feat: add my feature"

git push origin feature/my-feature
```

Then open a Pull Request.

---

# 📜 License

Add your preferred open-source license here.

For example:

```text
MIT License
```

---

# ⭐ Project Summary

**InsightTrove Interview Agent** combines:

```text
Resume Intelligence
        +
Generative AI
        +
Voice Analytics
        +
Computer Vision
        +
Interview Evaluation
        +
Performance Intelligence
        +
Personalized Coaching
```

to create a modern AI-powered interview preparation experience.

---

## 🚀 The Future of Interview Preparation

> **Don't just practice answers.**
>
> **Understand your performance.**
>
> **Find your gaps.**
>
> **Improve with data.**
>
> **Walk into the real interview prepared.**

**InsightTrove Interview Agent**
*AI-powered interview practice. Intelligent performance insights.*
