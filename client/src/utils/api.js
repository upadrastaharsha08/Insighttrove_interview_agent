import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
});

// Resume
export const uploadResume = (file) => {
  const form = new FormData();
  form.append('resume', file);
  return api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const generateQuestions = (resumeData, interviewType, count) =>
  api.post('/resume/generate-questions', { resumeData, interviewType, count });

// Interview
export const startInterview = (resumeData, questions, interviewType) =>
  api.post('/interview/start', { resumeData, questions, interviewType });

export const submitAnswer = (sessionId, questionId, answer, voiceMetrics, bodyMetrics) =>
  api.post('/interview/submit-answer', { sessionId, questionId, answer, voiceMetrics, bodyMetrics });

export const getSession = (sessionId) =>
  api.get(`/interview/session/${sessionId}`);

export const completeInterview = (sessionId) =>
  api.patch(`/interview/complete/${sessionId}`);

// Report
export const generateReport = (sessionId) =>
  api.post('/report/generate', { sessionId });

export const getReport = (sessionId) =>
  api.get(`/report/${sessionId}`);
