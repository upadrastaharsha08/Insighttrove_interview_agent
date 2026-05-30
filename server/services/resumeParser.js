import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parses a PDF buffer and returns raw text.
 */
export async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Parses a DOCX buffer and returns raw text.
 */
export async function parseDOCX(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Converts raw resume text into a structured JSON object
 * using rule-based extraction + Claude for intelligence.
 */
export function extractStructuredData(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Heuristic section detection
  const sections = {
    skills: [],
    experience: [],
    education: [],
    projects: [],
    rawText,
  };

  let currentSection = null;
  const sectionKeywords = {
    skills: ['skill', 'technologies', 'tech stack', 'tools', 'languages'],
    experience: ['experience', 'work history', 'employment', 'career'],
    education: ['education', 'qualification', 'degree', 'university', 'college'],
    projects: ['project', 'portfolio', 'built', 'developed'],
  };

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Detect section headers
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(kw => lower.includes(kw)) && line.length < 50) {
        currentSection = section;
        break;
      }
    }

    if (currentSection && line.length > 3) {
      if (!sections[currentSection].includes(line)) {
        sections[currentSection].push(line);
      }
    }
  }

  // Try to extract name from first few lines
  const name = lines.slice(0, 3).find(l => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(l)) || 'Candidate';

  return {
    name,
    rawText,
    skills: sections.skills.slice(0, 20),
    experience: sections.experience.slice(0, 15),
    education: sections.education.slice(0, 10),
    projects: sections.projects.slice(0, 15),
  };
}
