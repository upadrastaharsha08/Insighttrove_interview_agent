import Anthropic from '@anthropic-ai/sdk';
import NodeCache from 'node-cache';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Cache to avoid duplicate Claude calls
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Generate a full interview question set from resume.
 * Returns: { questions: [], resumeAnalysis: {} }
 */
export async function generateQuestions(resumeData, interviewType = 'technical', count = 8) {
  const cacheKey = `questions_${resumeData.name}_${interviewType}_${count}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const prompt = `You are an expert technical interviewer. Based on this resume, generate ${count} interview questions.

RESUME DATA:
Name: ${resumeData.name}
Skills: ${resumeData.skills.join(', ')}
Experience: ${resumeData.experience.slice(0, 5).join(' | ')}
Projects: ${resumeData.projects.slice(0, 5).join(' | ')}
Education: ${resumeData.education.slice(0, 3).join(' | ')}

Interview Type: ${interviewType}

Return ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "type": "technical|behavioral|project|situational",
      "category": "category name",
      "question": "the question text",
      "expectedTopics": ["topic1", "topic2"],
      "difficulty": "easy|medium|hard",
      "followUp": "a follow-up question"
    }
  ],
  "resumeAnalysis": {
    "strengths": ["strength1", "strength2"],
    "gaps": ["gap1", "gap2"],
    "suggestedFocusAreas": ["area1", "area2"]
  }
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const result = JSON.parse(text);
  cache.set(cacheKey, result);
  return result;
}

/**
 * Evaluate a single answer using Claude.
 * Returns detailed scoring and feedback.
 */
export async function evaluateAnswer(question, answer, resumeData, voiceMetrics = {}) {
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      feedback: 'No answer provided.',
      idealAnswer: '',
      mistakes: ['No answer given'],
      communicationScore: 0,
      technicalScore: 0,
    };
  }

  const prompt = `You are a senior technical interviewer evaluating a candidate's interview answer.

CANDIDATE: ${resumeData.name}
SKILLS ON RESUME: ${resumeData.skills.slice(0, 10).join(', ')}

QUESTION ASKED:
"${question.question}"
Type: ${question.type} | Difficulty: ${question.difficulty}
Expected Topics: ${question.expectedTopics?.join(', ') || 'N/A'}

CANDIDATE'S ANSWER:
"${answer}"

VOICE METRICS (if available):
Words per minute: ${voiceMetrics.wpm || 'N/A'}
Filler words count: ${voiceMetrics.fillerCount || 0}
Pause count: ${voiceMetrics.pauseCount || 0}

Evaluate strictly and return ONLY a valid JSON object (no markdown):
{
  "score": 0-100,
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "confidenceScore": 0-100,
  "feedback": "2-3 sentences of honest feedback",
  "idealAnswer": "what a strong answer would include",
  "mistakes": ["mistake1", "mistake2"],
  "strengths": ["strength1"],
  "improvement": "one actionable tip"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  return JSON.parse(text);
}

/**
 * Generate the final comprehensive interview report.
 */
export async function generateFinalReport(sessionData) {
  const {
    resumeData,
    questions,
    answers,
    evaluations,
    bodyLanguageData,
    voiceMetrics,
  } = sessionData;

  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((a, e) => a + (e.score || 0), 0) / evaluations.length)
    : 0;

  const prompt = `You are a professional interview coach. Generate a comprehensive interview performance report.

CANDIDATE: ${resumeData.name}

INTERVIEW SUMMARY:
- Questions answered: ${evaluations.length}
- Average score: ${avgScore}/100
- Technical scores: ${evaluations.map(e => e.technicalScore).join(', ')}
- Communication scores: ${evaluations.map(e => e.communicationScore).join(', ')}

BODY LANGUAGE (averaged):
- Eye contact: ${bodyLanguageData?.avgEyeContact || 'N/A'}%
- Posture: ${bodyLanguageData?.avgPosture || 'N/A'}%
- Head movement: ${bodyLanguageData?.avgHeadMovement || 'N/A'}

VOICE METRICS (averaged):
- Words per minute: ${voiceMetrics?.avgWpm || 'N/A'}
- Filler words: ${voiceMetrics?.totalFillers || 0}
- Confidence score: ${voiceMetrics?.avgConfidence || 'N/A'}%

WEAKNESSES FOUND:
${evaluations.flatMap(e => e.mistakes || []).slice(0, 10).join('\n')}

Generate a detailed coaching report. Return ONLY valid JSON (no markdown):
{
  "overall_score": 0-100,
  "communication": 0-100,
  "technical": 0-100,
  "confidence": 0-100,
  "body_language": 0-100,
  "resume_strength": 0-100,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "resume_gaps": ["gap1", "gap2"],
  "improvements": ["improvement1", "improvement2", "improvement3", "improvement4"],
  "ideal_answers": [],
  "next_interview_plan": {
    "week1": "focus area",
    "week2": "focus area",
    "week3": "focus area",
    "resources": ["resource1", "resource2"]
  },
  "summary": "2-3 sentence overall assessment"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  return JSON.parse(text);
}
