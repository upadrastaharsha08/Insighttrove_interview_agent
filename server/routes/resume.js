import express from 'express';
import multer from 'multer';
import { parsePDF, parseDOCX, extractStructuredData } from '../services/resumeParser.js';
import { generateQuestions } from '../services/claudeService.js';

const router = express.Router();

// Memory storage — no disk writes needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are supported'));
  },
});

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { mimetype, buffer } = req.file;
    let rawText;

    if (mimetype === 'application/pdf') {
      rawText = await parsePDF(buffer);
    } else {
      rawText = await parseDOCX(buffer);
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from resume. Please ensure it is not a scanned image.' });
    }

    const structured = extractStructuredData(rawText);
    res.json({ success: true, resumeData: structured });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resume/generate-questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { resumeData, interviewType = 'technical', count = 8 } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'resumeData is required' });

    const result = await generateQuestions(resumeData, interviewType, count);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Question generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
