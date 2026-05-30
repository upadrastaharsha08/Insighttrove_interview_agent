import express from 'express';
import { generateFinalReport } from '../services/claudeService.js';
import { sessions } from './interview.js';

const router = express.Router();

// POST /api/report/generate
router.post('/generate', async (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.evaluations.length === 0) {
    return res.status(400).json({ error: 'No evaluations found. Complete at least one question.' });
  }

  try {
    // Aggregate body language data
    const bodyLanguageSummary = session.bodyLanguageData.length > 0 ? {
      avgEyeContact: Math.round(
        session.bodyLanguageData.reduce((a, b) => a + (b.eyeContact || 0), 0) / session.bodyLanguageData.length
      ),
      avgPosture: Math.round(
        session.bodyLanguageData.reduce((a, b) => a + (b.posture || 0), 0) / session.bodyLanguageData.length
      ),
      avgHeadMovement: Math.round(
        session.bodyLanguageData.reduce((a, b) => a + (b.headMovement || 0), 0) / session.bodyLanguageData.length
      ),
    } : null;

    // Aggregate voice metrics
    const voiceSummary = session.voiceMetrics.length > 0 ? {
      avgWpm: Math.round(
        session.voiceMetrics.reduce((a, b) => a + (b.wpm || 0), 0) / session.voiceMetrics.length
      ),
      totalFillers: session.voiceMetrics.reduce((a, b) => a + (b.fillerCount || 0), 0),
      avgConfidence: Math.round(
        session.voiceMetrics.reduce((a, b) => a + (b.confidence || 0), 0) / session.voiceMetrics.length
      ),
    } : null;

    const report = await generateFinalReport({
      resumeData: session.resumeData,
      questions: session.questions,
      answers: session.answers,
      evaluations: session.evaluations,
      bodyLanguageData: bodyLanguageSummary,
      voiceMetrics: voiceSummary,
    });

    // Store report in session
    session.report = report;
    session.status = 'reported';

    res.json({ success: true, report, sessionId });
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/report/:sessionId
router.get('/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (!session.report) return res.status(404).json({ error: 'Report not generated yet' });
  res.json({ success: true, report: session.report });
});

export default router;
