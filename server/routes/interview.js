import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { evaluateAnswer } from '../services/claudeService.js';

const router = express.Router();

// In-memory session store (replace with Supabase/Firebase in production)
const sessions = new Map();

// POST /api/interview/start
router.post('/start', (req, res) => {
  const { resumeData, questions, interviewType } = req.body;
  if (!resumeData || !questions) return res.status(400).json({ error: 'resumeData and questions required' });

  const sessionId = uuidv4();
  sessions.set(sessionId, {
    id: sessionId,
    resumeData,
    questions,
    interviewType,
    answers: [],
    evaluations: [],
    bodyLanguageData: [],
    voiceMetrics: [],
    currentQuestionIndex: 0,
    startedAt: new Date().toISOString(),
    status: 'active',
  });

  res.json({ success: true, sessionId, firstQuestion: questions[0] });
});

// POST /api/interview/submit-answer
router.post('/submit-answer', async (req, res) => {
  const { sessionId, questionId, answer, voiceMetrics, bodyMetrics } = req.body;
  const session = sessions.get(sessionId);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  const question = session.questions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  try {
    // Evaluate answer via Claude
    const evaluation = await evaluateAnswer(question, answer, session.resumeData, voiceMetrics);

    session.answers.push({ questionId, answer, voiceMetrics, bodyMetrics });
    session.evaluations.push({ questionId, ...evaluation });

    if (bodyMetrics) session.bodyLanguageData.push(bodyMetrics);
    if (voiceMetrics) session.voiceMetrics.push(voiceMetrics);

    // Advance to next question
    session.currentQuestionIndex += 1;
    const nextQuestion = session.questions[session.currentQuestionIndex] || null;

    res.json({
      success: true,
      evaluation,
      nextQuestion,
      isComplete: !nextQuestion,
      progress: {
        current: session.currentQuestionIndex,
        total: session.questions.length,
      },
    });
  } catch (err) {
    console.error('Answer evaluation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interview/session/:id
router.get('/session/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  res.json({
    sessionId: session.id,
    status: session.status,
    progress: {
      current: session.currentQuestionIndex,
      total: session.questions.length,
    },
    evaluations: session.evaluations,
  });
});

// PATCH /api/interview/complete/:id
router.patch('/complete/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.status = 'completed';
  session.completedAt = new Date().toISOString();
  res.json({ success: true });
});

// Export sessions for report route to access
export { sessions };
export default router;
